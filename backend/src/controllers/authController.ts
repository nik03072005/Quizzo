import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import OTP from '../models/OTP';
import { sendOTPEmail } from '../utils/sendEmail';
import { sendOTPSMS, sendWelcomeSMS } from '../utils/sendSMS';
import { generateOTP } from '../utils/generateOTP';
import { uploadToR2, validateImage } from '../utils/r2Upload';
import { generateTokens } from '../middleware/auth';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Check if phone number is available
export const checkPhoneAvailability = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Please provide phone number' });
    }

    // Check if user exists with this phone number
    const existingUser = await User.findOne({ phoneNumber });
    
    res.status(200).json({ 
      available: !existingUser,
      message: existingUser ? 'Phone number already registered' : 'Phone number available'
    });
  } catch (error) {
    console.error('Check phone availability error:', error);
    res.status(500).json({ message: 'Failed to check phone availability' });
  }
};

// Upload School ID Image
export const uploadSchoolId = async (req: Request, res: Response) => {
  try {
    // Log upload request (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('� School ID upload request received');
      console.log('📁 Files in request:', req.file ? 'File present' : 'No file');
    }

    if (!req.file) {
      console.log('❌ No file provided in request');
      return res.status(400).json({ message: 'Please provide an image file' });
    }

    // Log file details in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    // Validate image
    const validation = validateImage(req.file.buffer, req.file.originalname);
    if (!validation.valid) {
      console.log('❌ Image validation failed:', validation.error);
      return res.status(400).json({ message: validation.error });
    }

    // Upload to Cloudflare R2
    const uploadResult = await uploadToR2(
      req.file.buffer,
      req.file.originalname,
      {
        type: 'school_id',
        uploadedAt: new Date().toISOString(),
      }
    );

    if (!uploadResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ R2 upload failed:', uploadResult.error);
      }
      return res.status(500).json({ message: 'Failed to upload image' });
    }

    res.status(200).json({
      message: 'School ID uploaded successfully',
      imageUrl: uploadResult.imageUrl,
      imageId: uploadResult.imageId,
    });
  } catch (error) {
    console.error('🚨 Upload school ID error:', error);
    res.status(500).json({ message: 'Failed to upload school ID' });
  }
};

// Send OTP for registration
export const sendRegistrationOTP = async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({ message: 'Please provide phone number' });
    }

    // Check if user exists with this phone number
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this phone number
    await OTP.deleteMany({ phoneNumber });

    // Save new OTP
    await OTP.create({
      phoneNumber,
      otp,
      type: 'phone',
      expiresAt,
    });

    // Send OTP SMS
    try {
      await sendOTPSMS(phoneNumber, otp);
      res.status(200).json({
        message: 'OTP sent to your phone number',
      });
    } catch (smsError) {
      // SMS failed but OTP is saved, so in development we can continue
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NODE_ENV === 'development') {
          console.log('📱 SMS failed, but OTP is available in console for development');
          console.log(`🔑 DEVELOPMENT OTP FOR ${phoneNumber}: ${otp}`);
        }
        res.status(200).json({
          message: 'OTP generated (check console for development)',
          developmentNote: 'SMS service unavailable - OTP logged to console',
          ...(process.env.NODE_ENV === 'development' && { developmentOTP: otp })
        });
      } else {
        // In production, clean up the OTP and return error
        await OTP.deleteOne({ phoneNumber });
        throw smsError;
      }
    }
  } catch (error) {
    console.error('Send registration OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Register new user (after OTP verification)
export const register = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, otp, password, name, email, schoolId, confirmPassword } = req.body;

    // Validation
    if (!phoneNumber || !otp || !password || !name || !schoolId || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify OTP first
    const otpRecord = await OTP.findOne({ phoneNumber, otp, type: 'phone' });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check if user exists (double check)
    const existingUser = await User.findOne({ 
      $or: [
        { phoneNumber },
        ...(email ? [{ email }] : [])
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      phoneNumber,
      email: email || undefined, // Only include email if provided
      password: hashedPassword,
      schoolId,
      displayName: name, // Use name as display name
      isPhoneVerified: true, // Phone is verified via OTP
    });

    // Delete the OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Send welcome SMS
    try {
      await sendWelcomeSMS(phoneNumber, name);
    } catch (error) {
      // Don't fail registration if welcome SMS fails
      console.error('Welcome SMS failed:', error);
    }

    // Generate JWT tokens
    const tokens = generateTokens((user._id as any).toString());

    res.status(201).json({
      message: 'User registered successfully',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/phone and password' });
    }

    // Find user by email or phone number and include password
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT tokens
    const tokens = generateTokens((user._id as any).toString());

    res.status(200).json({
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Forgot password - Send OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body; // can be email or phone

    if (!identifier) {
      return res.status(400).json({ message: 'Please provide email or phone number' });
    }

    // Check if user exists
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email or phone number' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Determine if it's email or phone
    const isEmail = identifier.includes('@');
    const isPhone = !isEmail;

    // Delete any existing OTPs for this identifier
    if (isEmail) {
      await OTP.deleteMany({ email: identifier });
    } else {
      await OTP.deleteMany({ phoneNumber: identifier });
    }

    // Save new OTP
    await OTP.create({
      ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
      otp,
      type: isEmail ? 'email' : 'phone',
      expiresAt,
    });

    // Send OTP
    try {
      if (isEmail) {
        await sendOTPEmail(identifier, otp);
        res.status(200).json({
          message: 'OTP sent to your email address',
        });
      } else {
        await sendOTPSMS(identifier, otp);
        res.status(200).json({
          message: 'OTP sent to your phone number',
        });
      }
    } catch (sendError) {
      // Send failed but OTP is saved, so in development we can continue
      if (process.env.NODE_ENV === 'development') {
        console.log(`${isEmail ? '📧' : '📱'} ${isEmail ? 'Email' : 'SMS'} failed, but OTP is available in console for development`);
        if (!isEmail) {
          console.log(`🔑 DEVELOPMENT FORGOT PASSWORD OTP FOR ${identifier}: ${otp}`);
        }
        res.status(200).json({
          message: 'OTP generated (check console for development)',
          developmentNote: `${isEmail ? 'Email' : 'SMS'} service unavailable - OTP logged to console`,
          ...(process.env.NODE_ENV === 'development' && !isEmail && { developmentOTP: otp })
        });
      } else {
        // In production, clean up the OTP and return error
        if (isEmail) {
          await OTP.deleteOne({ email: identifier });
        } else {
          await OTP.deleteOne({ phoneNumber: identifier });
        }
        throw sendError;
      }
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body; // identifier can be email or phone

    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Please provide email/phone and OTP' });
    }

    // Determine if it's email or phone
    const isEmail = identifier.includes('@');

    // Find OTP
    const otpRecord = await OTP.findOne({ 
      ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
      otp,
      type: isEmail ? 'email' : 'phone'
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.status(200).json({
      message: 'OTP verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Determine if it's email or phone
    const isEmail = identifier.includes('@');

    // Verify OTP
    const otpRecord = await OTP.findOne({ 
      ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
      otp,
      type: isEmail ? 'email' : 'phone'
    });
    
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Find user
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: 'Please provide email or phone number' });
    }

    // Determine if it's email or phone
    const isEmail = identifier.includes('@');

    // Check if user exists
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { phoneNumber: identifier }
      ]
    });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email or phone number' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete old OTPs
    if (isEmail) {
      await OTP.deleteMany({ email: identifier });
    } else {
      await OTP.deleteMany({ phoneNumber: identifier });
    }

    // Save new OTP
    await OTP.create({
      ...(isEmail ? { email: identifier } : { phoneNumber: identifier }),
      otp,
      type: isEmail ? 'email' : 'phone',
      expiresAt,
    });

    // Send OTP
    if (isEmail) {
      await sendOTPEmail(identifier, otp);
      res.status(200).json({
        message: 'OTP sent to your email',
      });
    } else {
      await sendOTPSMS(identifier, otp);
      res.status(200).json({
        message: 'OTP sent to your phone',
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    // User is attached to request by auth middleware
    const user = await User.findById((req as any).user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
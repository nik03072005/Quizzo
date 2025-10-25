import express from 'express';
import {
  sendRegistrationOTP,
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
  getMe,
  uploadSchoolId,
  upload,
  checkPhoneAvailability,
} from '../controllers/authController';
import { protect, refreshTokenMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/check-phone-availability', checkPhoneAvailability);
router.post('/send-registration-otp', sendRegistrationOTP);
router.post('/upload-school-id', upload.single('schoolId'), uploadSchoolId);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

// Token management
router.post('/refresh-token', refreshTokenMiddleware);

// Protected routes
router.get('/me', protect, getMe);

export default router;
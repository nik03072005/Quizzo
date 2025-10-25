// SMS service using Twilio
import twilio from 'twilio';

export const sendOTPSMS = async (phoneNumber: string, otp: string): Promise<void> => {
  try {
    // Only log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(50));
      console.log(`📱 SMS OTP for ${phoneNumber}`);
      console.log(`🔑 OTP CODE: ${otp}`);
      console.log('⏰ Expires in: 10 minutes');
      console.log('='.repeat(50) + '\n');
    }
    
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Twilio not configured - using console OTP for development');
        return; // Success in development without Twilio
      } else {
        throw new Error('Twilio SMS service not configured');
      }
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Send SMS
    const message = await client.messages.create({
      body: `Your Quizzo verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ SMS sent successfully! Message SID: ${message.sid}`);
    console.log(`📊 Message Status: ${message.status}`);
    console.log(`💰 Message Price: ${message.price || 'N/A'} ${message.priceUnit || ''}`);
    
  } catch (error: any) {
    console.error('❌ Error sending SMS:', error);
    
    // Log specific Twilio error details
    if (error.code) {
      console.error(`🚨 Twilio Error Code: ${error.code}`);
      console.error(`📝 Twilio Error Message: ${error.message}`);
      console.error(`🔗 More Info: ${error.moreInfo || 'N/A'}`);
    }
    
    // For development: Don't fail, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 SMS service failed - using console OTP for development');
      return;
    }
    
    // Only throw error in production
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

export const sendWelcomeSMS = async (phoneNumber: string, displayName: string): Promise<void> => {
  try {
    console.log(`📱 Welcome SMS for ${phoneNumber}: Welcome to Quizzo, ${displayName}!`);
    
    // Check if Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log('🔐 Twilio not configured - skipping welcome SMS');
      return;
    }

    // Initialize Twilio client
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    // Send welcome SMS
    const message = await client.messages.create({
      body: `🎯 Welcome to Quizzo, ${displayName}! Get ready to challenge your knowledge and compete with friends. Start playing now!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`✅ Welcome SMS sent! Message SID: ${message.sid}`);
    
  } catch (error) {
    console.error('❌ Error sending welcome SMS:', error);
    // Don't throw error for welcome SMS - it's not critical
  }
};
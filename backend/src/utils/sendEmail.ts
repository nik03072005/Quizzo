import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Quizzo App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Quizzo - Password Reset OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1E232C; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f4f4f4; padding: 30px; }
            .otp-box { background-color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #35C2C1; letter-spacing: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Quizzo</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password. Use the OTP code below to continue:</p>
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
              </div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2025 Quizzo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    // For development: If email fails, log OTP to console and continue
    console.log(`🔐 OTP for ${email}: ${otp}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('� Email service unavailable - using console OTP for development');
      // Don't throw error in development, just continue with console OTP
      return;
    }
    
    // Only throw error in production
    throw new Error('Failed to send email');
  }
};
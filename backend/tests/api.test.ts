// Simple unit tests for core functions
import dotenv from 'dotenv';
import { generateOTP } from '../src/utils/generateOTP';

// Load environment variables for tests
dotenv.config();

describe('Utils Tests', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = generateOTP();
      
      expect(typeof otp).toBe('string');
      expect(otp.length).toBe(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs on multiple calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      
      // While there's a small chance they could be the same, 
      // it's very unlikely with 6-digit OTPs
      expect(otp1).not.toBe(otp2);
    });
  });
});

describe('Environment Configuration', () => {
  it('should have required environment variables', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});
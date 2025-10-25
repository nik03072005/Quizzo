import mongoose, { Schema, Document } from 'mongoose';

export interface IOTP extends Document {
  email?: string;
  phoneNumber?: string;
  otp: string;
  type: 'email' | 'phone';
  expiresAt: Date;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema({
  email: {
    type: String,
    required: false,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'phone'],
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes
  },
});

// Custom validation to ensure either email or phoneNumber is provided
OTPSchema.pre('validate', function(next) {
  if (!this.email && !this.phoneNumber) {
    next(new Error('Either email or phoneNumber is required'));
  } else if (this.email && this.phoneNumber) {
    next(new Error('Only one of email or phoneNumber should be provided'));
  } else {
    next();
  }
});

// Index for faster queries and auto-cleanup
OTPSchema.index({ email: 1 });
OTPSchema.index({ phoneNumber: 1 });
OTPSchema.index({ expiresAt: 1 });

export default mongoose.model<IOTP>('OTP', OTPSchema);
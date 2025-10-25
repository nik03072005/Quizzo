import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phoneNumber: string;
  password: string;
  schoolId: string; // Cloudflare image URL for school ID/report card
  displayName: string;
  photoURL?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  friends: mongoose.Types.ObjectId[];
  stats: {
    totalQuizzesTaken: number;
    totalQuizzesCreated: number;
    averageScore: number;
    rank: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // Allow multiple null/undefined values
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    schoolId: {
      type: String,
      required: [true, 'School ID or report card is required'],
      trim: true,
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
    },
    photoURL: {
      type: String,
      default: '',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    stats: {
      totalQuizzesTaken: {
        type: Number,
        default: 0,
      },
      totalQuizzesCreated: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      rank: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries (phoneNumber and email already have unique indexes)
UserSchema.index({ 'stats.rank': -1 });

export default mongoose.model<IUser>('User', UserSchema);
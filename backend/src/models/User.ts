import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  isEmailVerified: boolean;
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
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
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

// Index for faster queries (email already has unique index)
UserSchema.index({ 'stats.rank': -1 });

export default mongoose.model<IUser>('User', UserSchema);
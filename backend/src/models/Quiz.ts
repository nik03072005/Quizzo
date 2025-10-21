import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3)
}

export interface IQuiz extends Document {
  name: string;
  description: string;
  type: 'general-knowledge' | 'science' | 'history' | 'technology' | 'sports' | 'entertainment' | 'geography' | 'literature' | 'mathematics' | 'other';
  duration: number; // Duration in minutes
  numberOfQuestions: number;
  questions: IQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  totalAttempts: number;
  averageScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters'],
  },
  options: {
    type: [String],
    required: [true, 'Question options are required'],
    validate: {
      validator: function(options: string[]) {
        return options.length === 4;
      },
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be between 0 and 3'],
    max: [3, 'Correct answer index must be between 0 and 3'],
  },
});

const QuizSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Quiz name is required'],
      trim: true,
      maxlength: [100, 'Quiz name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Quiz type is required'],
      enum: {
        values: ['general-knowledge', 'science', 'history', 'technology', 'sports', 'entertainment', 'geography', 'literature', 'mathematics', 'other'],
        message: 'Please select a valid quiz type',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Quiz duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [180, 'Duration cannot exceed 180 minutes'],
    },
    numberOfQuestions: {
      type: Number,
      required: [true, 'Number of questions is required'],
      min: [1, 'Quiz must have at least 1 question'],
      max: [100, 'Quiz cannot have more than 100 questions'],
    },
    questions: {
      type: [QuestionSchema],
      required: [true, 'Questions are required'],
      validate: {
        validator: function(questions: IQuestion[]) {
          return questions.length === this.numberOfQuestions;
        },
        message: 'Number of questions must match the numberOfQuestions field',
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function(tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: [0, 'Average score cannot be negative'],
      max: [100, 'Average score cannot exceed 100'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
QuizSchema.index({ type: 1, difficulty: 1 });
QuizSchema.index({ createdAt: -1 });
QuizSchema.index({ tags: 1 });

// Virtual to get quiz statistics
QuizSchema.virtual('stats').get(function() {
  return {
    totalAttempts: this.totalAttempts,
    averageScore: this.averageScore,
    difficulty: this.difficulty,
  };
});

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
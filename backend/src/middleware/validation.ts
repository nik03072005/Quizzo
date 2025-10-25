import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation schemas
export const schemas = {
  register: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required',
      }),
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'OTP must be exactly 6 digits',
        'any.required': 'OTP is required',
      }),
    password: Joi.string()
      .min(6)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'string.pattern.base': 'Name can only contain letters and spaces',
        'any.required': 'Name is required',
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address',
      }),
    schoolId: Joi.string()
      .optional()
      .messages({
        'string.base': 'School ID must be a string',
      }),
  }),

  login: Joi.object({
    identifier: Joi.string()
      .required()
      .messages({
        'any.required': 'Email or phone number is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  sendOTP: Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required',
      }),
  }),

  forgotPassword: Joi.object({
    identifier: Joi.string()
      .required()
      .messages({
        'any.required': 'Email or phone number is required',
      }),
  }),

  resetPassword: Joi.object({
    identifier: Joi.string()
      .required()
      .messages({
        'any.required': 'Email or phone number is required',
      }),
    otp: Joi.string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        'string.pattern.base': 'OTP must be exactly 6 digits',
        'any.required': 'OTP is required',
      }),
    newPassword: Joi.string()
      .min(6)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 100 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'New password is required',
      }),
  }),

  createQuiz: Joi.object({
    name: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Quiz name must be at least 3 characters long',
        'string.max': 'Quiz name cannot exceed 100 characters',
        'any.required': 'Quiz name is required',
      }),
    description: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Quiz description is required',
      }),
    type: Joi.string()
      .valid('general-knowledge', 'science', 'history', 'technology', 'sports', 'entertainment', 'geography', 'literature', 'mathematics', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid quiz type',
        'any.required': 'Quiz type is required',
      }),
    difficulty: Joi.string()
      .valid('easy', 'medium', 'hard')
      .default('medium'),
    duration: Joi.number()
      .min(1)
      .max(180)
      .required()
      .messages({
        'number.min': 'Duration must be at least 1 minute',
        'number.max': 'Duration cannot exceed 180 minutes',
        'any.required': 'Quiz duration is required',
      }),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string()
            .min(10)
            .max(500)
            .required(),
          options: Joi.array()
            .items(Joi.string().min(1).max(100))
            .length(4)
            .required(),
          correctAnswer: Joi.number()
            .min(0)
            .max(3)
            .required(),
        })
      )
      .min(1)
      .max(100)
      .required(),
  }),
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    next();
  };
};
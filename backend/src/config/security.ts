import { Request, Response, NextFunction } from 'express';

/**
 * Security Configuration Module
 * Handles HTTPS enforcement, security headers, and other security measures
 */

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent information disclosure
  res.removeHeader('X-Powered-By');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );
  
  // Strict Transport Security (HTTPS only)
  if (process.env.FORCE_HTTPS === 'true') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), fullscreen=(self)'
  );

  next();
};

// HTTPS enforcement middleware
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.FORCE_HTTPS === 'true' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }
  next();
};

// Secure cookie configuration
export const secureCookieConfig = {
  httpOnly: true,
  secure: process.env.SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// JWT Configuration
export const jwtConfig = {
  accessTokenExpire: process.env.JWT_EXPIRE || '7d',
  refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  issuer: 'quizzo-app',
  audience: 'quizzo-users',
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
};

// Auth-specific rate limiting
export const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
};

// OTP rate limiting
export const otpRateLimitConfig = {
  windowMs: parseInt(process.env.OTP_RATE_LIMIT_WINDOW || '5') * 60 * 1000,
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX || '3'),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many OTP requests, please wait before requesting again.',
  },
};

// Input validation configuration
export const validationConfig = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128,
  },
  
  // File upload limits
  fileUpload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  
  // API limits
  api: {
    maxRequestSize: '10mb',
    maxParameterLimit: 1000,
  },
};

export default {
  securityHeaders,
  enforceHTTPS,
  secureCookieConfig,
  jwtConfig,
  rateLimitConfig,
  authRateLimitConfig,
  otpRateLimitConfig,
  validationConfig,
};
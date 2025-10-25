import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

/**
 * Global error handling middleware
 */
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default error values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Something went wrong';

  // Log error details
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Different error handling for development and production
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

/**
 * Development error response - includes stack trace
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Production error response - minimal information
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: err.message,
      code: err.code,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
};

/**
 * Handle 404 errors - route not found
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err: AppError = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  err.isOperational = true;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
};

/**
 * Handle async errors without try-catch
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Create operational error
 */
export const createAppError = (message: string, statusCode: number, code?: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.code = code;
  return error;
};
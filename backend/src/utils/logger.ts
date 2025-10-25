// Simple, clean logging utility
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  // Internal method to format messages
  private formatMessage(level: string, emoji: string, message: string): string {
    const timestamp = new Date().toISOString();
    if (this.isDevelopment) {
      return `${emoji} ${message}`;
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  // Log levels
  info(message: string): void {
    console.log(this.formatMessage('info', '📝', message));
  }

  error(message: string, error?: Error): void {
    const fullMessage = error ? `${message}: ${error.message}` : message;
    console.error(this.formatMessage('error', '❌', fullMessage));
    if (error?.stack && this.isDevelopment) {
      console.error(error.stack);
    }
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', '⚠️', message));
  }

  debug(message: string): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', '🔍', message));
    }
  }

  http(message: string): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('http', '🔗', message));
    }
  }

  success(message: string): void {
    console.log(this.formatMessage('success', '✅', message));
  }
}

const logger = new Logger();
export default logger;

// Helper functions for structured logging
export const loggers = {
  // System logs
  system: {
    startup: (port: number, env: string) => 
      logger.success(`Server running on port ${port} (${env})`),
    shutdown: () => 
      logger.info('Server shutting down'),
    dbConnect: (host: string) => 
      logger.success(`MongoDB Connected: ${host}`),
    dbError: (error: string) => 
      logger.error(`Database error: ${error}`)
  },

  // Authentication logs
  auth: {
    login: (userId: string, ip?: string) => 
      logger.info(`User login: ${userId} from ${ip || 'unknown'}`),
    register: (userId: string) => 
      logger.info(`New user registered: ${userId}`),
    otpSent: (to: string, type: 'sms' | 'email') => 
      logger.info(`OTP sent via ${type} to ${to.substring(0, 4)}****`),
    failed: (reason: string, ip?: string) => 
      logger.warn(`Auth failed: ${reason} from ${ip || 'unknown'}`)
  },

  // Upload logs
  upload: {
    start: (filename: string, size: number) => 
      logger.debug(`Upload started: ${filename} (${size} bytes)`),
    success: (filename: string, url: string) => 
      logger.success(`Upload successful: ${filename} → ${url}`),
    failed: (filename: string, error: string) => 
      logger.error(`Upload failed: ${filename} - ${error}`)
  },

  // API logs
  api: {
    request: (method: string, path: string, ip?: string) => 
      logger.http(`${method} ${path} from ${ip || 'unknown'}`),
    slow: (method: string, path: string, time: number) => 
      logger.warn(`Slow request: ${method} ${path} took ${time}ms`),
    error: (method: string, path: string, error: string) => 
      logger.error(`API error: ${method} ${path} - ${error}`)
  }
};
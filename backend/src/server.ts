import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import quizRoutes from './routes/quizRoutes';
import logger, { loggers } from './utils/logger';
import { securityHeaders, enforceHTTPS } from './config/security';
import { generalLimiter } from './middleware/rateLimiter';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Security middleware (applied first)
app.use(enforceHTTPS); // HTTPS enforcement
app.use(securityHeaders); // Security headers

// Rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Token-Near-Expiry'],
  maxAge: 86400, // 24 hours preflight cache
}));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  loggers.api.request(req.method, req.url, req.ip || req.connection.remoteAddress);
  if (req.method === 'POST' && req.url.includes('upload')) {
    logger.debug(`Upload request detected - Content-Type: ${req.headers['content-type']}`);
  }
  next();
});

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 1000 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Quizzo Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Security test route (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/security-test', (req: Request, res: Response) => {
    res.json({
      headers: {
        'X-Frame-Options': res.getHeader('X-Frame-Options'),
        'X-Content-Type-Options': res.getHeader('X-Content-Type-Options'),
        'X-XSS-Protection': res.getHeader('X-XSS-Protection'),
        'Content-Security-Policy': res.getHeader('Content-Security-Policy'),
        'Strict-Transport-Security': res.getHeader('Strict-Transport-Security'),
      },
      environment: process.env.NODE_ENV,
      httpsEnforced: process.env.FORCE_HTTPS === 'true',
      secureCookies: process.env.SECURE_COOKIES === 'true',
    });
  });
}

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0'; // Listen on all interfaces for mobile app access

// Get network IP for display (optional, for development convenience)
const getNetworkIP = () => {
  try {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (error) {
    return 'unknown';
  }
  return 'unknown';
};

app.listen(PORT, HOST, () => {
  const networkIP = getNetworkIP();
  
  loggers.system.startup(PORT, process.env.NODE_ENV || 'development');
  logger.info(`Local API: http://localhost:${PORT}/api`);
  
  if (networkIP !== 'unknown') {
    logger.info(`Network API: http://${networkIP}:${PORT}/api`);
    logger.info(`Health check (Network): http://${networkIP}:${PORT}/health`);
    logger.info(`Mobile device should connect to: http://${networkIP}:${PORT}/api`);
  }
  
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
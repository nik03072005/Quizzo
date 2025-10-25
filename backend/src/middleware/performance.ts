import { Request, Response, NextFunction } from 'express';
import { loggers } from '../utils/logger';

interface ApiMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userAgent?: string;
  ip?: string;
  timestamp: Date;
}

class MetricsCollector {
  private metrics: ApiMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests in memory

  addMetric(metric: ApiMetrics) {
    this.metrics.push(metric);
    
    // Keep only the last N metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(endpoint?: string): ApiMetrics[] {
    if (endpoint) {
      return this.metrics.filter(m => m.endpoint === endpoint);
    }
    return this.metrics;
  }

  getAverageResponseTime(endpoint?: string): number {
    const relevantMetrics = this.getMetrics(endpoint);
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return totalTime / relevantMetrics.length;
  }

  getErrorRate(endpoint?: string): number {
    const relevantMetrics = this.getMetrics(endpoint);
    if (relevantMetrics.length === 0) return 0;
    
    const errorCount = relevantMetrics.filter(m => m.statusCode >= 400).length;
    return (errorCount / relevantMetrics.length) * 100;
  }

  getSummary() {
    const totalRequests = this.metrics.length;
    const errorRate = this.getErrorRate();
    const avgResponseTime = this.getAverageResponseTime();
    
    return {
      totalRequests,
      errorRate: Math.round(errorRate * 100) / 100,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }
}

export const metricsCollector = new MetricsCollector();

// Middleware to track API performance
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Store original send function
  const originalSend = res.send;
  
  // Override send function to capture response time and status
  res.send = function(body) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Collect metrics
    metricsCollector.addMetric({
      endpoint: req.path,
      method: req.method,
      responseTime,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date(),
    });

    // Log slow requests
    if (responseTime > 1000) {
      loggers.api.slow(req.method, req.path, responseTime);
    }

    // Call original send function
    return originalSend.call(this, body);
  };

  next();
};

// Health check endpoint with metrics
export const getHealthMetrics = (req: Request, res: Response) => {
  const summary = metricsCollector.getSummary();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    metrics: summary,
  });
};
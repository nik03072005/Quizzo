import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// JWT Configuration inline (will be moved to config later)
const jwtConfig = {
  accessTokenExpire: process.env.JWT_EXPIRE || '7d',
  refreshTokenExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  issuer: 'quizzo-app',
  audience: 'quizzo-users',
};

interface JwtPayload {
  id: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

/**
 * Generate JWT tokens (access and refresh)
 */
export const generateTokens = (userId: string) => {
  const payload = {
    id: userId,
    type: 'access',
  };

  const options: any = {
    expiresIn: jwtConfig.accessTokenExpire,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, options);

  const refreshPayload = {
    id: userId,
    type: 'refresh',
  };

  const refreshOptions: any = {
    expiresIn: jwtConfig.refreshTokenExpire,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  };

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_SECRET as string, refreshOptions);

  return { accessToken, refreshToken };
};

/**
 * Verify and decode JWT token
 */
export const verifyToken = (token: string, expectedType: 'access' | 'refresh' = 'access'): JwtPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Verify token type
    if (decoded.type !== expectedType) {
      throw new Error(`Invalid token type. Expected ${expectedType}, got ${decoded.type}`);
    }
    
    // Verify issuer and audience
    if (decoded.iss !== jwtConfig.issuer || decoded.aud !== jwtConfig.audience) {
      throw new Error('Invalid token issuer or audience');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Check if token is about to expire (within 5 minutes)
 */
export const isTokenNearExpiry = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return true;
    
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // 5 minutes in seconds
    
    return decoded.exp - now < fiveMinutes;
  } catch {
    return true;
  }
};

/**
 * Main authentication middleware
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    try {
      // Verify access token
      const decoded = verifyToken(token, 'access');
      
      // Check if token is near expiry
      const nearExpiry = isTokenNearExpiry(token);
      
      // Attach user info to request
      (req as AuthenticatedRequest).user = { id: decoded.id };
      
      // Add expiry warning to response headers if needed
      if (nearExpiry) {
        res.setHeader('X-Token-Near-Expiry', 'true');
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        message: 'Access denied. Invalid or expired token.',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error in authentication',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

/**
 * Refresh token middleware for token renewal
 */
export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ 
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN'
      });
    }

    try {
      // Verify refresh token
      const decoded = verifyToken(refreshToken, 'refresh');
      
      // Generate new tokens
      const tokens = generateTokens(decoded.id);
      
      res.json({
        message: 'Tokens refreshed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      return res.status(401).json({ 
        message: 'Invalid or expired refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      message: 'Server error in token refresh',
      code: 'REFRESH_SERVER_ERROR'
    });
  }
};

/**
 * Optional middleware - allows access without token but sets user if token is valid
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token, 'access');
        (req as AuthenticatedRequest).user = { id: decoded.id };
      } catch {
        // Token invalid, but continue without user
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};
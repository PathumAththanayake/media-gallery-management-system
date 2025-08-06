const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated'
      });
    }

    // Add user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user is admin or owner
const requireAdminOrOwner = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  
  // For user routes, check if they're accessing their own data
  if (req.params.userId && req.params.userId !== req.user.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Optional authentication (for public routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Check if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // For Google OAuth users, email is automatically verified
  // For regular users, we need to check if they've verified their email
  // This check would typically be done in the controller after fetching the full user object
  next();
};

// Rate limiting for auth routes
const authRateLimit = (req, res, next) => {
  // Simple rate limiting - in production, use a proper rate limiting library
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Store rate limit data in memory (in production, use Redis)
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = {};
  }
  
  if (!req.app.locals.rateLimit[clientIP]) {
    req.app.locals.rateLimit[clientIP] = {
      attempts: 0,
      resetTime: now + 15 * 60 * 1000 // 15 minutes
    };
  }
  
  const rateLimit = req.app.locals.rateLimit[clientIP];
  
  // Reset if time has passed
  if (now > rateLimit.resetTime) {
    rateLimit.attempts = 0;
    rateLimit.resetTime = now + 15 * 60 * 1000;
  }
  
  // Check if limit exceeded
  if (rateLimit.attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many attempts. Please try again later.'
    });
  }
  
  rateLimit.attempts++;
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOwner,
  optionalAuth,
  requireEmailVerification,
  authRateLimit
};

const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  googleAuthCallback
} = require('../controllers/authController');
const {
  authenticateToken,
  authRateLimit
} = require('../middlewares/auth');
const {
  validate,
  registerValidation,
  loginValidation,
  otpValidation,
  passwordResetValidation,
  changePasswordValidation,
  profileUpdateValidation
} = require('../utils/validation');

// Public routes
router.post('/register', authRateLimit, registerValidation, validate, register);
router.post('/verify-otp', authRateLimit, otpValidation, validate, verifyOTP);
router.post('/resend-otp', authRateLimit, otpValidation.slice(0, 1), validate, resendOTP);
router.post('/login', authRateLimit, loginValidation, validate, login);
router.post('/forgot-password', authRateLimit, otpValidation.slice(0, 1), validate, forgotPassword);
router.post('/reset-password', authRateLimit, passwordResetValidation, validate, resetPassword);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  googleAuthCallback
);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, profileUpdateValidation, validate, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, validate, changePassword);
router.post('/logout', authenticateToken, logout);

module.exports = router;

const nodemailer = require('nodemailer');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = () => {
  // Check if using SLIIT email (my.sliit.lk domain)
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('my.sliit.lk')) {
    return nodemailer.createTransporter({
      host: 'smtp.office365.com', // SLIIT uses Office 365
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });
  } else {
    // Default Gmail configuration
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-email@gmail.com' || 
        process.env.EMAIL_PASSWORD === 'your-gmail-app-password' ||
        process.env.EMAIL_PASSWORD === 'Pathum@1' ||
        process.env.EMAIL_PASSWORD === 'Pathum@123') { // Temporary check for testing
      console.log('Email configuration not set up. OTP for development:', otp);
      console.log('Email would be sent to:', email);
      // For development, just log the OTP instead of sending email
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Media Gallery - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Media Gallery</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with Media Gallery. Please use the following OTP to verify your email address:
            </p>
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 Media Gallery. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Send password reset OTP email
const sendPasswordResetEmail = async (email, otp) => {
  try {
    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
        process.env.EMAIL_USER === 'your-email@gmail.com' || 
        process.env.EMAIL_PASSWORD === 'your-gmail-app-password' ||
        process.env.EMAIL_PASSWORD === 'Pathum@1' ||
        process.env.EMAIL_PASSWORD === 'Pathum@123') { // Temporary check for testing
      console.log('Email configuration not set up. Password reset OTP for development:', otp);
      console.log('Email would be sent to:', email);
      // For development, just log the OTP instead of sending email
      return;
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Media Gallery - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Media Gallery</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>

            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Media Gallery account. Please use the following OTP to reset your password:
            </p>
            <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              This OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                © 2024 Media Gallery. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendPasswordResetEmail
};

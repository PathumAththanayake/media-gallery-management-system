const mongoose = require('mongoose');
const User = require('./backend/models/User');
const { generateOTP, sendOTPEmail } = require('./backend/utils/otp');
require('dotenv').config({ path: './env_files/backend.env' });

async function testOTPSystem() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test email
    const testEmail = 'test@example.com';
    
    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // Test sending OTP email
    console.log('Testing OTP email sending...');
    await sendOTPEmail(testEmail, otp);
    console.log('OTP email test completed');

    // Test creating a user with OTP
    console.log('Testing user creation with OTP...');
    const user = new User({
      name: 'Test User',
      email: testEmail,
      password: 'testpassword123',
      otp: otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      role: 'user'
    });

    await user.save();
    console.log('User created with OTP:', user._id);

    // Test OTP verification
    console.log('Testing OTP verification...');
    const foundUser = await User.findOne({ email: testEmail });
    
    if (foundUser.otp === otp && foundUser.otpExpiry > new Date()) {
      console.log('OTP verification successful');
      
      // Mark email as verified
      foundUser.isEmailVerified = true;
      foundUser.otp = undefined;
      foundUser.otpExpiry = undefined;
      await foundUser.save();
      console.log('Email marked as verified');
    } else {
      console.log('OTP verification failed');
    }

    // Clean up - delete test user
    await User.findByIdAndDelete(user._id);
    console.log('Test user deleted');

    console.log('OTP system test completed successfully!');
  } catch (error) {
    console.error('OTP system test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testOTPSystem(); 
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'user@mediagallery.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: user@mediagallery.com');
      console.log('Password: user123');
      console.log('Role:', existingUser.role);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'user@mediagallery.com',
      password: 'user123',
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });

    await testUser.save();
    
    console.log('Test user created successfully!');
    console.log('Email: user@mediagallery.com');
    console.log('Password: user123');
    console.log('Role: user');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestUser(); 
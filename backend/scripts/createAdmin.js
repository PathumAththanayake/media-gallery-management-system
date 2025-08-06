const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@mediagallery.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email: admin@mediagallery.com');
      console.log('Password: admin123');
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@mediagallery.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });

    await adminUser.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@mediagallery.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createAdminUser(); 
// Test script for ZIP download functionality
const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Test data
const testMediaIds = [
  '507f1f77bcf86cd799439011', // Replace with actual media IDs from your database
  '507f1f77bcf86cd799439012',
  '507f1f77bcf86cd799439013'
];

async function testZipDownload() {
  try {
    console.log('Testing ZIP download functionality...');
    
    // First, login to get a token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@example.com', // Replace with actual admin credentials
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test ZIP download
    const zipResponse = await axios.post(
      `${API_URL}/api/media/download-zip`,
      {
        mediaIds: testMediaIds
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );
    
    console.log('✅ ZIP download successful');
    console.log('Response headers:', zipResponse.headers);
    console.log('Content-Type:', zipResponse.headers['content-type']);
    console.log('Content-Disposition:', zipResponse.headers['content-disposition']);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testZipDownload(); 
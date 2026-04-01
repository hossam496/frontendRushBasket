/**
 * API Test Script
 * Tests all major API endpoints and functionality
 */

import API from './src/services/api.js';

const testAPI = async () => {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await API.get('/api/health');
    console.log('✅ Health Check:', healthResponse.data);

    // Test 2: Get Products
    console.log('\n2. Testing Get Products...');
    const productsResponse = await API.get('/api/products');
    console.log('✅ Products fetched:', productsResponse.data.length, 'products');

    // Test 3: Test Image Service
    console.log('\n3. Testing Image Service...');
    const { resolveImageSrc } = await import('./src/services/imageService.js');
    const testImage = resolveImageSrc('/uploads/products/test.jpg');
    console.log('✅ Image resolution:', testImage);

    // Test 4: Test Environment Variables
    console.log('\n4. Testing Environment Variables...');
    console.log('✅ API URL:', import.meta.env.VITE_API_URL);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAPI();
}

export default testAPI;

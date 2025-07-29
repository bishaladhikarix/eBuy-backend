/**
 * API Test for Fuzzy Brand Search
 * This tests the actual HTTP endpoints with fuzzy brand search
 */

import http from 'http';

// Test configuration
const TEST_HOST = 'localhost';
const TEST_PORT = 5000;

function makeRequest(path, callback) {
  const options = {
    hostname: TEST_HOST,
    port: TEST_PORT,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        callback(null, response, res.statusCode);
      } catch (error) {
        callback(error, null, res.statusCode);
      }
    });
  });

  req.on('error', (error) => {
    callback(error, null, null);
  });

  req.end();
}

function runApiTests() {
  console.log('=== API Fuzzy Search Tests ===\n');
  
  // Test 1: Regular product fetch (no fuzzy search)
  console.log('Test 1: Regular product fetch');
  makeRequest('/api/products?limit=5', (error, response, statusCode) => {
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log(`✅ Status: ${statusCode}`);
      console.log(`✅ Found ${response.data?.products?.length || 0} products`);
    }
    
    // Test 2: Fuzzy brand search
    console.log('\nTest 2: Fuzzy brand search for "Sam"');
    makeRequest('/api/products?brand_search=Sam&fuzzy=true&limit=10', (error, response, statusCode) => {
      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log(`✅ Status: ${statusCode}`);
        const products = response.data?.products || [];
        console.log(`✅ Found ${products.length} products with fuzzy brand search`);
        
        products.forEach(product => {
          console.log(`  - ${product.brand} (${product.title}) - Score: ${product.searchScore}%`);
        });
      }
      
      // Test 3: Non-fuzzy brand search
      console.log('\nTest 3: Non-fuzzy brand search for "Sam"');
      makeRequest('/api/products?brand_search=Sam&fuzzy=false&limit=10', (error, response, statusCode) => {
        if (error) {
          console.log('❌ Error:', error.message);
        } else {
          console.log(`✅ Status: ${statusCode}`);
          const products = response.data?.products || [];
          console.log(`✅ Found ${products.length} products with regular brand search`);
          
          products.forEach(product => {
            console.log(`  - ${product.brand} (${product.title})`);
          });
        }
        
        console.log('\n=== API Tests Complete ===');
      });
    });
  });
}

// Check if server is running first
const checkReq = http.request({
  hostname: TEST_HOST,
  port: TEST_PORT,
  path: '/api/products?limit=1',
  method: 'GET'
}, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('🚀 Server is running, starting tests...\n');
    runApiTests();
  } else {
    console.log(`❌ Server responded with status ${res.statusCode}`);
  }
});

checkReq.on('error', (error) => {
  console.log('❌ Server is not running. Please start the server first with: npm start');
  console.log('   Then run this test again.');
});

checkReq.end();

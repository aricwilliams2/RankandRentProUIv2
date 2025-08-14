// Test script for Call Forwarding API endpoints
// Run this in your browser console or as a Node.js script

const API_BASE_URL = 'http://localhost:3000'; // Update this to your API URL
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with your actual token

// Test functions
async function testGetMyNumbers() {
    console.log('🔍 Testing GET /api/twilio/my-numbers...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/my-numbers`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Phone Numbers Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching phone numbers:', error);
        return null;
    }
}

async function testGetCallForwardings() {
    console.log('🔍 Testing GET /api/call-forwarding...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/call-forwarding`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Call Forwardings Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching call forwardings:', error);
        return null;
    }
}

async function testCreateCallForwarding(phoneNumberId, forwardToNumber) {
    console.log('🔍 Testing POST /api/call-forwarding...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/call-forwarding`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone_number_id: parseInt(phoneNumberId, 10),
                forward_to_number: forwardToNumber,
                forwarding_type: 'always',
                ring_timeout: 20
            })
        });
        
        const data = await response.json();
        console.log('✅ Create Call Forwarding Response:', data);
        return data;
    } catch (error) {
        console.error('❌ Error creating call forwarding:', error);
        return null;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Call Forwarding API Tests...\n');
    
    // Test 1: Get phone numbers
    const phoneNumbers = await testGetMyNumbers();
    
    if (phoneNumbers && phoneNumbers.success && phoneNumbers.phoneNumbers && phoneNumbers.phoneNumbers.length > 0) {
        console.log(`📱 Found ${phoneNumbers.phoneNumbers.length} phone numbers`);
        
        // Test 2: Get existing call forwardings
        const callForwardings = await testGetCallForwardings();
        
        if (callForwardings && callForwardings.success) {
            console.log(`📞 Found ${callForwardings.callForwardings ? callForwardings.callForwardings.length : 0} call forwarding rules`);
        }
        
        // Test 3: Try to create a call forwarding (this should fail if one already exists)
        const firstPhoneNumber = phoneNumbers.phoneNumbers[0];
        console.log(`\n🧪 Testing with phone number: ${firstPhoneNumber.phone_number} (ID: ${firstPhoneNumber.id})`);
        
        await testCreateCallForwarding(firstPhoneNumber.id, '+1234567890');
        
    } else {
        console.log('❌ No phone numbers found or error occurred');
    }
    
    console.log('\n✅ Tests completed!');
}

// Instructions
console.log(`
📋 Call Forwarding API Test Script
================================

To use this script:

1. Replace AUTH_TOKEN with your actual JWT token
2. Update API_BASE_URL if needed
3. Run the script in your browser console or as Node.js

To get your JWT token:
1. Open browser dev tools
2. Go to Application/Storage tab
3. Look for localStorage
4. Find the 'token' key

Then run: runTests()
`);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests, testGetMyNumbers, testGetCallForwardings, testCreateCallForwarding };
}

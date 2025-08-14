// Call Forwarding Integration Test Script
// This script tests the complete call forwarding setup

const API_BASE_URL = 'http://localhost:3000'; // Update to your API URL
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with your actual token

// Test functions
async function testDatabaseCallForwarding() {
    console.log('🔍 Testing Database Call Forwarding Settings...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/call-forwarding`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Database Call Forwarding Response:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            console.log(`📞 Found ${data.data.length} call forwarding rules in database`);
            return data.data;
        } else {
            console.log('⚠️ No call forwarding rules found in database');
            return [];
        }
    } catch (error) {
        console.error('❌ Error testing database call forwarding:', error);
        return [];
    }
}

async function testPhoneNumberConfiguration() {
    console.log('🔍 Testing Phone Number Configuration...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/my-numbers`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Phone Numbers Response:', data);
        
        if (data.success && data.phoneNumbers && data.phoneNumbers.length > 0) {
            console.log(`📱 Found ${data.phoneNumbers.length} phone numbers`);
            
            // Check each phone number's configuration
            for (const phoneNumber of data.phoneNumbers) {
                console.log(`\n📞 Phone Number: ${phoneNumber.phone_number}`);
                console.log(`   - Voice URL: ${phoneNumber.voice_url || 'NOT SET'}`);
                console.log(`   - Status Callback: ${phoneNumber.status_callback || 'NOT SET'}`);
                console.log(`   - Voice Method: ${phoneNumber.voice_method || 'NOT SET'}`);
                
                if (!phoneNumber.voice_url) {
                    console.log('   ❌ Voice URL not configured - calls will hang up!');
                } else if (!phoneNumber.voice_url.includes('/api/twilio/twiml')) {
                    console.log('   ⚠️ Voice URL may not be correct TwiML endpoint');
                } else {
                    console.log('   ✅ Voice URL configured correctly');
                }
            }
            
            return data.phoneNumbers;
        } else {
            console.log('⚠️ No phone numbers found');
            return [];
        }
    } catch (error) {
        console.error('❌ Error testing phone number configuration:', error);
        return [];
    }
}

async function testTwiMLEndpoint(phoneNumber, forwardToNumber) {
    console.log('🔍 Testing TwiML Endpoint...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/twiml`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                Direction: 'inbound',
                Called: phoneNumber,
                Caller: '+1234567890',
                CallSid: 'test-call-sid-123',
                From: '+1234567890',
                To: phoneNumber
            })
        });
        
        const twiml = await response.text();
        console.log('✅ TwiML Response:', twiml);
        
        if (twiml.includes('<Dial>') && twiml.includes(forwardToNumber)) {
            console.log('✅ TwiML endpoint working correctly - call forwarding configured');
            return true;
        } else if (twiml.includes('<Say>') && twiml.includes('no call forwarding')) {
            console.log('⚠️ TwiML endpoint working but no call forwarding configured for this number');
            return false;
        } else {
            console.log('❌ TwiML endpoint not working as expected');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing TwiML endpoint:', error);
        return false;
    }
}

async function testEnvironmentVariables() {
    console.log('🔍 Testing Environment Variables...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/status`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('✅ Environment Status:', data);
        
        if (data.success) {
            console.log('✅ Environment variables configured correctly');
            return true;
        } else {
            console.log('❌ Environment variables missing or incorrect');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing environment variables:', error);
        return false;
    }
}

// Main integration test
async function runIntegrationTest() {
    console.log('🚀 Starting Call Forwarding Integration Test...\n');
    
    // Test 1: Environment Variables
    const envOk = await testEnvironmentVariables();
    console.log('');
    
    // Test 2: Database Call Forwarding
    const callForwardings = await testDatabaseCallForwarding();
    console.log('');
    
    // Test 3: Phone Number Configuration
    const phoneNumbers = await testPhoneNumberConfiguration();
    console.log('');
    
    // Test 4: TwiML Endpoint (if we have data)
    if (callForwardings.length > 0 && phoneNumbers.length > 0) {
        const firstForwarding = callForwardings[0];
        const matchingPhone = phoneNumbers.find(pn => pn.id == firstForwarding.phone_number_id);
        
        if (matchingPhone) {
            await testTwiMLEndpoint(matchingPhone.phone_number, firstForwarding.forward_to_number);
        }
    }
    
    // Summary
    console.log('\n📋 Integration Test Summary:');
    console.log(`   - Environment Variables: ${envOk ? '✅ OK' : '❌ ISSUES'}`);
    console.log(`   - Database Call Forwarding: ${callForwardings.length > 0 ? '✅ OK' : '❌ NO RULES'}`);
    console.log(`   - Phone Numbers: ${phoneNumbers.length > 0 ? '✅ OK' : '❌ NO NUMBERS'}`);
    
    if (phoneNumbers.length > 0) {
        const configuredNumbers = phoneNumbers.filter(pn => pn.voice_url && pn.voice_url.includes('/api/twilio/twiml'));
        console.log(`   - Configured Phone Numbers: ${configuredNumbers.length}/${phoneNumbers.length}`);
        
        if (configuredNumbers.length < phoneNumbers.length) {
            console.log('\n⚠️ Some phone numbers are not configured for call forwarding!');
            console.log('   Run the update-phone-number-config.js script to fix this.');
        }
    }
    
    console.log('\n✅ Integration test completed!');
}

// Instructions
console.log(`
📋 Call Forwarding Integration Test
==================================

This script tests your complete call forwarding setup:

1. Environment variables configuration
2. Database call forwarding settings
3. Phone number TwiML configuration
4. TwiML endpoint functionality

To use this script:

1. Replace AUTH_TOKEN with your actual JWT token
2. Update API_BASE_URL if needed
3. Run the script

To get your JWT token:
1. Open browser dev tools
2. Go to Application/Storage tab
3. Look for localStorage
4. Find the 'token' key

Then run: runIntegrationTest()
`);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        runIntegrationTest, 
        testDatabaseCallForwarding, 
        testPhoneNumberConfiguration, 
        testTwiMLEndpoint,
        testEnvironmentVariables
    };
}

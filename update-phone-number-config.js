// Phone Number Configuration Update Script
// This script updates all phone numbers to use the correct TwiML endpoint

const API_BASE_URL = 'http://localhost:3000'; // Update to your API URL
const AUTH_TOKEN = 'your-jwt-token-here'; // Replace with your actual token

// Configuration settings
const TWIML_CONFIG = {
    voice_url: `${API_BASE_URL}/api/twilio/twiml`,
    voice_method: 'POST',
    status_callback: `${API_BASE_URL}/api/twilio/status-callback`,
    status_callback_method: 'POST',
    status_callback_event: ['initiated', 'ringing', 'answered', 'completed']
};

async function getPhoneNumbers() {
    console.log('🔍 Fetching phone numbers...');
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/my-numbers`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.phoneNumbers) {
            console.log(`✅ Found ${data.phoneNumbers.length} phone numbers`);
            return data.phoneNumbers;
        } else {
            console.log('❌ No phone numbers found');
            return [];
        }
    } catch (error) {
        console.error('❌ Error fetching phone numbers:', error);
        return [];
    }
}

async function updatePhoneNumber(phoneNumberId, config) {
    console.log(`🔧 Updating phone number ${phoneNumberId}...`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/twilio/my-numbers/${phoneNumberId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log(`✅ Phone number ${phoneNumberId} updated successfully`);
            return true;
        } else {
            console.log(`❌ Failed to update phone number ${phoneNumberId}:`, data.message);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error updating phone number ${phoneNumberId}:`, error);
        return false;
    }
}

async function checkPhoneNumberConfig(phoneNumber) {
    const needsUpdate = !phoneNumber.voice_url || 
                       !phoneNumber.voice_url.includes('/api/twilio/twiml') ||
                       phoneNumber.voice_method !== 'POST';
    
    return {
        phoneNumber,
        needsUpdate,
        currentConfig: {
            voice_url: phoneNumber.voice_url || 'NOT SET',
            voice_method: phoneNumber.voice_method || 'NOT SET',
            status_callback: phoneNumber.status_callback || 'NOT SET'
        }
    };
}

async function updateAllPhoneNumbers() {
    console.log('🚀 Starting Phone Number Configuration Update...\n');
    
    // Get all phone numbers
    const phoneNumbers = await getPhoneNumbers();
    
    if (phoneNumbers.length === 0) {
        console.log('❌ No phone numbers to update');
        return;
    }
    
    console.log('\n📋 Current Configuration Status:');
    const configChecks = [];
    
    for (const phoneNumber of phoneNumbers) {
        const check = await checkPhoneNumberConfig(phoneNumber);
        configChecks.push(check);
        
        console.log(`\n📞 ${phoneNumber.phone_number} (ID: ${phoneNumber.id})`);
        console.log(`   - Voice URL: ${check.currentConfig.voice_url}`);
        console.log(`   - Voice Method: ${check.currentConfig.voice_method}`);
        console.log(`   - Status Callback: ${check.currentConfig.status_callback}`);
        console.log(`   - Needs Update: ${check.needsUpdate ? '❌ YES' : '✅ NO'}`);
    }
    
    // Filter phone numbers that need updates
    const numbersToUpdate = configChecks.filter(check => check.needsUpdate);
    
    if (numbersToUpdate.length === 0) {
        console.log('\n✅ All phone numbers are already configured correctly!');
        return;
    }
    
    console.log(`\n🔧 Updating ${numbersToUpdate.length} phone numbers...`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const check of numbersToUpdate) {
        const success = await updatePhoneNumber(check.phoneNumber.id, TWIML_CONFIG);
        
        if (success) {
            successCount++;
        } else {
            failureCount++;
        }
        
        // Add a small delay between updates
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`   - Total phone numbers: ${phoneNumbers.length}`);
    console.log(`   - Updated successfully: ${successCount}`);
    console.log(`   - Failed to update: ${failureCount}`);
    
    if (successCount > 0) {
        console.log('\n✅ Phone number configuration update completed!');
        console.log('📞 Your phone numbers should now handle incoming calls with call forwarding.');
    } else {
        console.log('\n❌ No phone numbers were updated successfully.');
        console.log('🔍 Check your authentication token and API endpoint.');
    }
}

async function verifyConfiguration() {
    console.log('\n🔍 Verifying configuration after update...');
    
    const phoneNumbers = await getPhoneNumbers();
    let allConfigured = true;
    
    for (const phoneNumber of phoneNumbers) {
        const check = await checkPhoneNumberConfig(phoneNumber);
        
        if (check.needsUpdate) {
            console.log(`❌ ${phoneNumber.phone_number} still needs configuration`);
            allConfigured = false;
        } else {
            console.log(`✅ ${phoneNumber.phone_number} configured correctly`);
        }
    }
    
    if (allConfigured) {
        console.log('\n🎉 All phone numbers are properly configured for call forwarding!');
    } else {
        console.log('\n⚠️ Some phone numbers still need configuration.');
    }
}

// Main function
async function runConfigurationUpdate() {
    console.log(`
📋 Phone Number Configuration Update
====================================

This script will update all your phone numbers to use the correct TwiML endpoint
for call forwarding functionality.

Configuration that will be applied:
- Voice URL: ${TWIML_CONFIG.voice_url}
- Voice Method: ${TWIML_CONFIG.voice_method}
- Status Callback: ${TWIML_CONFIG.status_callback}
- Status Callback Method: ${TWIML_CONFIG.status_callback_method}

To use this script:

1. Replace AUTH_TOKEN with your actual JWT token
2. Update API_BASE_URL if needed
3. Run the script

To get your JWT token:
1. Open browser dev tools
2. Go to Application/Storage tab
3. Look for localStorage
4. Find the 'token' key

Then run: runConfigurationUpdate()
`);

    await updateAllPhoneNumbers();
    await verifyConfiguration();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        runConfigurationUpdate, 
        updateAllPhoneNumbers, 
        getPhoneNumbers, 
        updatePhoneNumber,
        checkPhoneNumberConfig,
        verifyConfiguration
    };
}

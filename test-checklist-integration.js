// Test file for checklist API integration
// Run this with: node test-checklist-integration.js

const API_BASE_URL = 'http://localhost:3000';

// Test credentials - replace with actual test user credentials
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'testpassword'
};

const TEST_CLIENT_ID = 1; // Replace with actual test client ID

async function testChecklistAPI() {
  console.log('🧪 Testing Checklist API Integration...\n');

  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    if (!token) {
      throw new Error('No token received from login');
    }

    console.log('✅ Login successful\n');

    // Step 2: Test getting client checklist
    console.log('2. Testing getClientChecklist...');
    const checklistResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!checklistResponse.ok) {
      throw new Error(`Get checklist failed: ${checklistResponse.status} ${checklistResponse.statusText}`);
    }

    const checklistData = await checklistResponse.json();
    console.log('✅ Get checklist successful');
    console.log(`   Found ${Object.keys(checklistData.data || {}).length} items\n`);

    // Step 3: Test getting completion stats
    console.log('3. Testing getCompletionStats...');
    const statsResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!statsResponse.ok) {
      throw new Error(`Get stats failed: ${statsResponse.status} ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Get stats successful');
    console.log(`   Total: ${statsData.data.total_items}, Completed: ${statsData.data.completed_items}, Incomplete: ${statsData.data.incomplete_items}\n`);

    // Step 4: Test toggling a checklist item
    console.log('4. Testing toggleChecklistItem...');
    const testItemId = 'gmb-1'; // Use a known checklist item ID
    
    const toggleResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}/item/${testItemId}/toggle`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCompleted: true }),
    });

    if (!toggleResponse.ok) {
      throw new Error(`Toggle item failed: ${toggleResponse.status} ${toggleResponse.statusText}`);
    }

    const toggleData = await toggleResponse.json();
    console.log('✅ Toggle item successful');
    console.log(`   Item ${testItemId} is now ${toggleData.data.is_completed ? 'completed' : 'incomplete'}\n`);

    // Step 5: Test getting completed items
    console.log('5. Testing getCompletedItems...');
    const completedResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}/completed`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!completedResponse.ok) {
      throw new Error(`Get completed items failed: ${completedResponse.status} ${completedResponse.statusText}`);
    }

    const completedData = await completedResponse.json();
    console.log('✅ Get completed items successful');
    console.log(`   Found ${completedData.data.length} completed items\n`);

    // Step 6: Test getting incomplete items
    console.log('6. Testing getIncompleteItems...');
    const incompleteResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}/incomplete`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!incompleteResponse.ok) {
      throw new Error(`Get incomplete items failed: ${incompleteResponse.status} ${incompleteResponse.statusText}`);
    }

    const incompleteData = await incompleteResponse.json();
    console.log('✅ Get incomplete items successful');
    console.log(`   Found ${incompleteData.data.length} incomplete items\n`);

    // Step 7: Test reset functionality (optional - uncomment to test)
    /*
    console.log('7. Testing resetChecklist...');
    const resetResponse = await fetch(`${API_BASE_URL}/api/checklist/client/${TEST_CLIENT_ID}/reset`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!resetResponse.ok) {
      throw new Error(`Reset checklist failed: ${resetResponse.status} ${resetResponse.statusText}`);
    }

    console.log('✅ Reset checklist successful\n');
    */

    console.log('🎉 All tests passed! The checklist API integration is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your frontend application');
    console.log('2. Navigate to a client and click the checklist button');
    console.log('3. Try checking/unchecking items to see them persist in the database');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your backend server is running on http://localhost:3000');
    console.log('2. Verify the test credentials are correct');
    console.log('3. Check that the test client ID exists in your database');
    console.log('4. Ensure the checklist API endpoints are properly implemented');
  }
}

// Run the test
testChecklistAPI();

# Call Forwarding Setup Guide

## 🚨 Current Issue

Your call forwarding is working in the database but calls are hanging up because the Twilio phone numbers aren't properly configured to use your TwiML endpoint.

## 🔧 Quick Fix Steps

### Step 1: Test Your Current Setup

1. **Get your JWT token**:
   - Open browser dev tools (F12)
   - Go to Application/Storage tab
   - Look for localStorage
   - Find the 'token' key and copy its value

2. **Update the test script**:
   ```bash
   # Edit test-call-forwarding-integration.js
   const AUTH_TOKEN = 'your-actual-jwt-token-here';
   ```

3. **Run the integration test**:
   ```bash
   node test-call-forwarding-integration.js
   ```

### Step 2: Fix Phone Number Configuration

If the test shows configuration issues:

1. **Update the config script**:
   ```bash
   # Edit update-phone-number-config.js
   const AUTH_TOKEN = 'your-actual-jwt-token-here';
   ```

2. **Run the configuration update**:
   ```bash
   node update-phone-number-config.js
   ```

### Step 3: Test Call Forwarding

1. **Call your Twilio number** from another phone
2. **Check if the call is forwarded** to your configured number
3. **Check server logs** for TwiML processing

## 📋 What the Scripts Do

### `test-call-forwarding-integration.js`
- ✅ Tests environment variables
- ✅ Checks database call forwarding settings
- ✅ Verifies phone number configuration
- ✅ Tests TwiML endpoint functionality
- 📊 Provides a summary of issues found

### `update-phone-number-config.js`
- 🔍 Fetches all your phone numbers
- 📋 Shows current configuration status
- 🔧 Updates phone numbers that need configuration
- ✅ Verifies the updates were successful

## 🎯 Expected Results

After running the scripts, you should see:

```
📞 Phone Number: +1234567890
   - Voice URL: http://localhost:3000/api/twilio/twiml
   - Voice Method: POST
   - Status Callback: http://localhost:3000/api/twilio/status-callback
   - Needs Update: ✅ NO
```

## 🚨 Common Issues

### Issue: "Authentication failed"
**Solution**: Make sure your JWT token is correct and not expired

### Issue: "No phone numbers found"
**Solution**: Make sure you have purchased phone numbers in your account

### Issue: "TwiML endpoint not working"
**Solution**: Check that your backend server is running and accessible

### Issue: "Environment variables missing"
**Solution**: Make sure `SERVER_URL` is set correctly in your backend

## 🔍 Manual Verification

You can also check the Twilio Console:

1. **Log into Twilio Console**
2. **Go to Phone Numbers > Manage > Active numbers**
3. **Click on your phone number**
4. **Verify these settings**:
   - **Voice Configuration**: Webhook URL should be `http://localhost:3000/api/twilio/twiml`
   - **HTTP Method**: POST
   - **Status Callback URL**: `http://localhost:3000/api/twilio/status-callback`

## 📞 Testing Call Forwarding

1. **Set up call forwarding** in your dashboard
2. **Call your Twilio number** from another phone
3. **The call should be forwarded** to your configured number
4. **Check call logs** in your dashboard

## 🆘 If Issues Persist

1. **Run the integration test** to identify the problem
2. **Check server logs** for error messages
3. **Verify Twilio Console** configuration
4. **Test TwiML endpoint** directly
5. **Ensure environment variables** are set correctly

## 🔧 Environment Variables Required

Make sure these are set in your backend environment:

```bash
SERVER_URL=http://localhost:3000
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The most critical one is `SERVER_URL` - if this is wrong, call forwarding won't work!

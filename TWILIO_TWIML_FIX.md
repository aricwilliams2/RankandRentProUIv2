# Twilio TwiML Fix for Inbound/Outbound Calls

## Problem
The current TwiML webhook only handles **inbound** calls, but browser calls should be **outbound** calls. This causes browser calls to be treated as inbound calls and get the wrong TwiML response.

## Current Issue
When making a browser call, the server receives:
```json
{
  "Direction": "inbound",
  "From": "client:user_1755201356774", 
  "To": "(910) 755-5577",
  "Caller": "client:user_1755201356774"
}
```

But it should be:
```json
{
  "Direction": "outbound-api",
  "From": "+19106019073",
  "To": "+19107555577", 
  "Caller": "client:user_1755201356774"
}
```

## Solution: Updated TwiML Webhook

The server-side TwiML webhook needs to handle both inbound and outbound calls:

```javascript
// Updated TwiML webhook handler
app.post('/api/twilio/voice', (req, res) => {
  const { Direction, From, To, Caller, Called } = req.body;
  
  console.log('📞 TwiML request received:', {
    body: req.body,
    query: req.query
  });
  
  console.log(`📞 Call - Direction: ${Direction}, From: ${From}, To: ${To}, Called: ${Called}, Caller: ${Caller}`);
  
  // Handle different call directions
  if (Direction === 'inbound') {
    // Inbound call to your phone number
    console.log(`📞 Real inbound call received to: ${Called}`);
    
    // Check if this is a known phone number
    const phoneNumber = findPhoneNumber(Called);
    if (phoneNumber) {
      console.log(`📞 Known phone number: ${Called}`);
      // Return TwiML for inbound calls
      const twiml = new VoiceResponse();
      twiml.say('Hello! Thank you for calling our business.');
      twiml.pause({ length: 1 });
      twiml.say('Please leave a message after the beep.');
      twiml.record({
        maxLength: 30,
        action: '/api/twilio/recording-callback',
        transcribe: true
      });
      res.type('text/xml');
      res.send(twiml.toString());
    } else {
      console.log(`📞 Unknown phone number: ${Called}`);
      // Default response for unknown numbers
      const twiml = new VoiceResponse();
      twiml.say('Hello! Thank you for calling.');
      twiml.pause({ length: 1 });
      twiml.say('This is a Twilio phone system. Goodbye!');
      res.type('text/xml');
      res.send(twiml.toString());
    }
  } else if (Direction === 'outbound-api') {
    // Outbound call from browser/client
    console.log(`📞 Outbound call from browser: ${From} to ${To}`);
    
    // For outbound calls, we want to connect the call directly
    const twiml = new VoiceResponse();
    
    // Connect the call to the destination
    twiml.dial({
      callerId: From, // Use the client identity as caller ID
      record: 'record-from-answer',
      recordingStatusCallback: '/api/twilio/recording-callback'
    }, To);
    
    res.type('text/xml');
    res.send(twiml.toString());
  } else {
    // Handle other directions (outbound-dial, etc.)
    console.log(`📞 Other call direction: ${Direction}`);
    const twiml = new VoiceResponse();
    twiml.say('Call processing...');
    res.type('text/xml');
    res.send(twiml.toString());
  }
});
```

## Key Changes

### 1. Direction Detection
- Check `Direction` parameter to determine call type
- Handle `inbound` vs `outbound-api` differently

### 2. Inbound Call Handling
- For inbound calls: Play greeting and record message
- Check if the called number is known
- Provide appropriate business greeting

### 3. Outbound Call Handling  
- For outbound calls: Use `<Dial>` to connect the call
- Set proper `callerId` from the client identity
- Enable recording and status callbacks

### 4. Browser Call Configuration
The browser call should be configured to make outbound calls:

```javascript
// In BrowserCallComponent.tsx
const conn = await device.connect({
  params: {
    To: toNumber,
    From: selectedFromNumber, // Use selected phone number as caller ID
    Direction: 'outbound-api' // Explicitly set direction
  }
});
```

## Updated Access Token Configuration

The access token should include both inbound and outbound permissions:

```javascript
// Server-side access token generation
const token = new AccessToken(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_API_KEY,
  process.env.TWILIO_API_SECRET,
  { identity: userIdentity }
);

// Grant voice permissions for both inbound and outbound
const voiceGrant = new VoiceGrant({
  outgoingApplicationSid: process.env.TWILIO_APP_SID,
  incomingAllow: true, // Allow incoming calls
});

token.addGrant(voiceGrant);
```

## Phone Number Configuration

Each phone number needs to be configured with:

1. **Voice Webhook URL**: `/api/twilio/voice`
2. **HTTP Method**: POST
3. **Primary Handler**: For inbound calls
4. **Fallback Handler**: For error cases

## Testing

### Test Inbound Calls
1. Call your Twilio number from another phone
2. Should hear greeting and be able to leave message
3. Call should be recorded and logged

### Test Outbound Calls  
1. Use browser call interface
2. Call should connect directly to destination
3. Should be treated as outbound call
4. Call should be recorded and logged

## Expected Results

After implementing this fix:

- **Inbound calls** to your numbers will get proper business greeting
- **Outbound calls** from browser will connect directly to destination
- **Call direction** will be correctly identified in logs
- **Recordings** will work for both directions
- **Call logs** will show correct direction and details

## Implementation Steps

1. Update server-side TwiML webhook to handle both directions
2. Configure phone numbers with proper webhook URLs
3. Update access token generation to include both permissions
4. Test both inbound and outbound call scenarios
5. Verify call logs show correct direction and details 
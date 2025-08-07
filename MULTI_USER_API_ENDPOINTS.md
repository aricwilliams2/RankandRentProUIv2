# Multi-User Twilio API Endpoints

This document outlines the new API endpoints for the multi-user calling platform.

## 🔐 Authentication

All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### GET /api/twilio/access-token
Get Twilio Voice SDK access token for browser-based calling

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** This token is required for browser-based calling using the Twilio Voice SDK.

## 📞 Phone Number Management

### GET /api/twilio/my-numbers
Get user's phone numbers

**Response:**
```json
{
  "success": true,
  "phoneNumbers": [
    {
      "id": "1",
      "number": "+14155551234",
      "userId": "123",
      "twilioSid": "PN1234567890abcdef",
      "websiteId": "456",
      "provider": "twilio",
      "monthlyFee": 1.00,
      "callCount": 25,
      "status": "active",
      "country": "US",
      "region": "CA",
      "locality": "San Francisco",
      "capabilities": {
        "voice": true,
        "sms": true
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /api/twilio/available-numbers
Search available numbers for purchase

**Query Parameters:**
- `areaCode` (optional): Area code to search (e.g., "415")
- `country` (optional): Country code (default: "US")
- `limit` (optional): Max results (default: 10)

**Response:**
```json
{
  "success": true,
  "availableNumbers": [
    {
      "phoneNumber": "+14155559999",
      "locality": "San Francisco",
      "region": "CA",
      "capabilities": {
        "voice": true,
        "sms": true
      }
    }
  ]
}
```

### POST /api/twilio/buy-number
Purchase a phone number

**Request Body:**
```json
{
  "phoneNumber": "+14155559999",
  "country": "US",
  "areaCode": "415",
  "websiteId": "456"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "phoneNumber": {
    "id": "2",
    "number": "+14155559999",
    "userId": "123",
    "twilioSid": "PN9999888877776666",
    "websiteId": "456",
    "provider": "twilio",
    "monthlyFee": 1.00,
    "callCount": 0,
    "status": "active",
    "country": "US",
    "region": "CA",
    "locality": "San Francisco",
    "capabilities": {
      "voice": true,
      "sms": true
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  "message": "Phone number purchased successfully"
}
```

### PUT /api/twilio/my-numbers/:id
Update phone number settings

**Request Body:**
```json
{
  "websiteId": "789",
  "status": "inactive"
}
```

**Response:**
```json
{
  "success": true,
  "phoneNumber": { /* updated phone number object */ },
  "message": "Phone number updated successfully"
}
```

### DELETE /api/twilio/my-numbers/:id
Release a phone number

**Response:**
```json
{
  "success": true,
  "message": "Phone number released successfully"
}
```

## 📞 Call History & Recordings

### GET /api/twilio/call-logs
Get user's call history

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `status` (optional): Filter by call status
- `phoneNumberId` (optional): Filter by phone number

**Response:**
```json
{
  "success": true,
  "calls": [
    {
      "id": "1",
      "callSid": "CA1234567890abcdef",
      "userId": "123",
      "phoneNumberId": "1",
      "to": "+14155559876",
      "from": "+14155551234",
      "direction": "outbound",
      "status": "completed",
      "duration": 120,
      "price": 0.02,
      "priceUnit": "USD",
      "recordingUrl": "https://api.twilio.com/recordings/RE123.mp3",
      "recordingSid": "RE1234567890abcdef",
      "transcription": "Hello, this is a test call...",
      "startTime": "2024-01-01T12:00:00Z",
      "endTime": "2024-01-01T12:02:00Z",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:02:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

### GET /api/twilio/call-logs/:callSid
Get specific call details

**Response:**
```json
{
  "success": true,
  "call": {
    /* call object with full details */
  }
}
```

## 🎵 Recording Management

### GET /api/twilio/recordings
Get user's recordings

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `callSid` (optional): Filter by call SID
- `phoneNumberId` (optional): Filter by phone number

**Response:**
```json
{
  "success": true,
  "recordings": [
    {
      "id": "1",
      "recordingSid": "RE1234567890abcdef",
      "userId": "123",
      "callSid": "CA1234567890abcdef",
      "phoneNumberId": "1",
      "duration": 120,
      "channels": 1,
      "status": "completed",
      "mediaUrl": "https://api.twilio.com/recordings/RE123.mp3",
      "price": 0.0025,
      "priceUnit": "USD",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:02:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "totalItems": 1
  }
}
```

### GET /api/twilio/recordings/:callSid
Get recordings for specific call

**Response:**
```json
{
  "success": true,
  "recordings": [
    /* array of recording objects for the call */
  ]
}
```

### DELETE /api/twilio/recordings/:recordingSid
Delete a recording (user must own it)

**Response:**
```json
{
  "success": true,
  "message": "Recording deleted successfully"
}
```

## 🔒 Security & Validation

### User Ownership Validation
All endpoints validate that:
1. User owns the phone number before making calls
2. User can only see their own call logs and recordings
3. User can only manage their own phone numbers
4. Webhook callbacks validate number ownership

### Error Responses
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "You can only make calls from phone numbers you own"
}
```

```json
{
  "success": false,
  "error": "PHONE_NUMBER_NOT_FOUND",
  "message": "Phone number not found or not owned by user"
}
```

```json
{
  "success": false,
  "error": "INACTIVE_NUMBER",
  "message": "Cannot make calls from inactive phone numbers"
}
```

## 🪝 Webhook Endpoints

### POST /webhooks/twilio/call-status
Handle call status updates from Twilio

**Twilio sends:**
```json
{
  "CallSid": "CA1234567890abcdef",
  "CallStatus": "completed",
  "CallDuration": "120",
  "From": "+14155551234",
  "To": "+14155559876",
  "Price": "-0.02",
  "PriceUnit": "USD"
}
```

### POST /webhooks/twilio/recording-status
Handle recording status updates from Twilio

**Twilio sends:**
```json
{
  "RecordingSid": "RE1234567890abcdef",
  "CallSid": "CA1234567890abcdef",
  "RecordingStatus": "completed",
  "RecordingDuration": "120",
  "RecordingUrl": "https://api.twilio.com/recordings/RE123.mp3",
  "Price": "-0.0025",
  "PriceUnit": "USD"
}
```

## 💰 Cost Structure

### User Pays Model
- **Phone Numbers**: $1/month per number (billed to user)
- **Outbound Calls**: $0.0085/minute (billed to user)
- **Inbound Calls**: $0.0085/minute (billed to user)
- **Recordings**: $0.0025/minute (billed to user)
- **SMS**: $0.0075/message (billed to user)

### Your Costs
- **Twilio Account**: Free tier or pay-as-you-go
- **API Usage**: Minimal - only for number management
- **Server/Hosting**: Your existing infrastructure

## 🚀 Migration Steps

1. **Database**: Run the migration SQL to create new tables
2. **Environment**: Remove `TWILIO_PHONE_NUMBER`, keep other Twilio vars
3. **API**: Deploy new endpoints with user isolation
4. **Frontend**: Update UI to show user-owned numbers
5. **Webhooks**: Update webhook URLs in Twilio console
6. **Testing**: Test complete user workflow

## 📊 Analytics & Reporting

Users can view:
- Their phone numbers and usage
- Call history and costs
- Recording storage and costs
- Monthly billing summaries

Admins can view:
- Platform-wide usage statistics
- User activity and costs
- System health metrics
- Revenue tracking

## 🔧 Environment Variables

Required in your `.env`:
```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_APP_SID=APxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
SERVER_URL=https://your-api-domain.com
API_BASE_URL=https://your-api-domain.com

# Database
DATABASE_URL=your_database_connection_string

# JWT
JWT_SECRET=your_jwt_secret_here
```

## 🎯 Next Steps

1. **Phase 1**: Core multi-user platform ✅
2. **Phase 2**: SMS capabilities per number
3. **Phase 3**: Advanced call routing
4. **Phase 4**: Team/organization sharing
5. **Phase 5**: White-label solutions
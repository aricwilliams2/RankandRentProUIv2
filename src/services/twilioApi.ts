import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com';

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Multi-user Twilio API endpoints
export const twilioApi = {
  // === PHONE NUMBER MANAGEMENT ===
  
  // Get user's phone numbers
  getMyNumbers: async () => {
    const response = await apiClient.get('/twilio/my-numbers');
    return response.data;
  },

  // Search available numbers for purchase
  getAvailableNumbers: async (params: {
    areaCode?: string;
    country?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get('/twilio/available-numbers', { params });
    return response.data;
  },

  // Buy a phone number (user-specific)
  buyNumber: async (data: {
    phoneNumber: string;
    country?: string;
    areaCode?: string;
    websiteId?: string;
  }) => {
    const response = await apiClient.post('/twilio/buy-number', data);
    return response.data;
  },

  // Update phone number settings
  updatePhoneNumber: async (id: string, updates: {
    websiteId?: string;
    status?: 'active' | 'inactive';
  }) => {
    const response = await apiClient.put(`/twilio/my-numbers/${id}`, updates);
    return response.data;
  },

  // Release phone number
  releasePhoneNumber: async (id: string) => {
    const response = await apiClient.delete(`/twilio/my-numbers/${id}`);
    return response.data;
  },

  // === CALLING FUNCTIONALITY ===

  // Make a call using user's phone number
  makeCall: async (data: {
    to: string;
    from: string; // Must be user's owned number
    record?: boolean;
    websiteId?: string;
  }) => {
    const response = await apiClient.post('/twilio/call', data);
    return response.data;
  },

  // Get user's call history
  getCallLogs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    phoneNumberId?: string;
  } = {}) => {
    const response = await apiClient.get('/twilio/call-logs', { params });
    return response.data;
  },

  // Get specific call details
  getCallLog: async (callSid: string) => {
    const response = await apiClient.get(`/twilio/call-logs/${callSid}`);
    return response.data;
  },

  // === RECORDING MANAGEMENT ===

  // Get user's recordings
  getRecordings: async (params: {
    page?: number;
    limit?: number;
    callSid?: string;
    phoneNumberId?: string;
  } = {}) => {
    const response = await apiClient.get('/twilio/recordings', { params });
    return response.data;
  },

  // Get recordings for specific call
  getCallRecordings: async (callSid: string) => {
    const response = await apiClient.get(`/twilio/recordings/${callSid}`);
    return response.data;
  },

  // Delete recording (user must own it)
  deleteRecording: async (recordingSid: string) => {
    const response = await apiClient.delete(`/twilio/recordings/${recordingSid}`);
    return response.data;
  },

  // Stream recording audio (proxy endpoint - no login required)
  getRecordingStream: (recordingSid: string) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/twilio/recording/${recordingSid}?token=${token}`;
  },

  // Get recording stream with proper authorization headers
  getRecordingStreamWithAuth: async (recordingSid: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/twilio/recording/${recordingSid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'audio/wav'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recording: ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // === LEGACY ENDPOINTS (for backward compatibility) ===
  
  // Get phone numbers (legacy - redirects to getMyNumbers)
  getPhoneNumbers: async () => {
    const response = await apiClient.get('/twilio/phone-numbers');
    return response.data;
  },

  // Delete phone number (legacy - redirects to releasePhoneNumber)
  deletePhoneNumber: async (phoneNumberId: string) => {
    const response = await apiClient.delete(`/twilio/phone-numbers/${phoneNumberId}`);
    return response.data;
  },
}; 
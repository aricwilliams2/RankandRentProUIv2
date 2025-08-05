import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

// Twilio API endpoints
export const twilioApi = {
  // Buy a phone number
  buyNumber: async (data: {
    phoneNumber: string;
    country?: string;
    areaCode?: string;
    websiteId?: string;
  }) => {
    const response = await apiClient.post('/api/twilio/buy-number', data);
    return response.data;
  },

  // Get available numbers
  getAvailableNumbers: async (params: {
    areaCode?: string;
    country?: string;
    limit?: number;
  }) => {
    const response = await apiClient.get('/api/twilio/available-numbers', { params });
    return response.data;
  },

  // Make a call
  makeCall: async (data: {
    to: string;
    from: string;
    record?: boolean;
    websiteId?: string;
  }) => {
    const response = await apiClient.post('/api/twilio/call', data);
    return response.data;
  },

  // Get call logs
  getCallLogs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    phoneNumberId?: string;
  } = {}) => {
    const response = await apiClient.get('/api/twilio/call-logs', { params });
    return response.data;
  },

  // Get specific call log
  getCallLog: async (callSid: string) => {
    const response = await apiClient.get(`/api/twilio/call-logs/${callSid}`);
    return response.data;
  },

  // Get recordings
  getRecordings: async (params: {
    page?: number;
    limit?: number;
    callSid?: string;
  } = {}) => {
    const response = await apiClient.get('/api/twilio/recordings', { params });
    return response.data;
  },

  // Get recordings for specific call
  getCallRecordings: async (callSid: string) => {
    const response = await apiClient.get(`/api/twilio/recordings/${callSid}`);
    return response.data;
  },

  // Delete recording
  deleteRecording: async (recordingSid: string) => {
    const response = await apiClient.delete(`/api/twilio/recordings/${recordingSid}`);
    return response.data;
  },

  // Get phone numbers (existing functionality)
  getPhoneNumbers: async () => {
    const response = await apiClient.get('/api/twilio/phone-numbers');
    return response.data;
  },

  // Delete phone number
  deletePhoneNumber: async (phoneNumberId: string) => {
    const response = await apiClient.delete(`/api/twilio/phone-numbers/${phoneNumberId}`);
    return response.data;
  },
}; 
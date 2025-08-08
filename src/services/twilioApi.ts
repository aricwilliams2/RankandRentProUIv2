// src/api/twilioApi.ts (or .js if you prefer JS)
import axios from 'axios';

// ---- Env: loaded by Vite based on mode (dev/prod) ----
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fail loudly if missing so you catch bad builds immediately
if (!API_BASE_URL) {
  // You’ll see the mode in the console to help debug
  // Ensure .env.development or .env.production has VITE_API_BASE_URL set
  console.error('VITE_API_BASE_URL is not set. Current mode:', import.meta.env.MODE);
  throw new Error('Missing VITE_API_BASE_URL');
}

// ---- Axios instance with auth interceptor ----
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Twilio API wrapper (multi-user) ----
export const twilioApi = {
  // === AUTHENTICATION ===

  /**
   * Get Twilio Voice SDK access token (POST, matches backend guide).
   * Backend route expects: POST /api/twilio/access-token with { identity }
   */
  getAccessToken: async (identity?: string) => {
    const effectiveIdentity = identity ?? `user_${Date.now()}`;
    console.log('[Twilio] Requesting access token:', {
      url: `${API_BASE_URL}/api/twilio/access-token`,
      identity: effectiveIdentity,
    });

    try {
      const response = await apiClient.post('/api/twilio/access-token', {
        identity: effectiveIdentity,
      });
      console.log('[Twilio] Access token response:', response.status, response.data);
      return response.data; // { success, token, identity, availableNumbers }
    } catch (error) {
      console.error('[Twilio] Access token error:', error);
      // Bubble up server details if present
      // @ts-ignore - if using JS, ignore TS
      if (error?.response) {
        // @ts-ignore
        console.error('Response status:', error.response.status);
        // @ts-ignore
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // === PHONE NUMBER MANAGEMENT ===

  // Get user's phone numbers
  getMyNumbers: async () => {
    const res = await apiClient.get('/api/twilio/my-numbers');
    return res.data;
  },

  // Search available numbers for purchase
  getAvailableNumbers: async (params: {
    areaCode?: string;
    country?: string;
    limit?: number;
  }) => {
    const res = await apiClient.get('/api/twilio/available-numbers', { params });
    return res.data;
  },

  // Buy a phone number (user-specific)
  buyNumber: async (data: {
    phoneNumber: string;
    country?: string;
    areaCode?: string;
    websiteId?: string;
  }) => {
    const res = await apiClient.post('/api/twilio/buy-number', data);
    return res.data;
  },

  // Update phone number settings
  updatePhoneNumber: async (
    id: string,
    updates: { websiteId?: string; status?: 'active' | 'inactive' }
  ) => {
    const res = await apiClient.put(`/api/twilio/my-numbers/${id}`, updates);
    return res.data;
  },

  // Release phone number
  releasePhoneNumber: async (id: string) => {
    const res = await apiClient.delete(`/api/twilio/my-numbers/${id}`);
    return res.data;
  },

  // === CALL LOGS ===

  // Get user's call history
  getCallLogs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    phoneNumberId?: string;
  } = {}) => {
    const res = await apiClient.get('/api/twilio/call-logs', { params });
    return res.data;
  },

  // Get specific call details
  getCallLog: async (callSid: string) => {
    const res = await apiClient.get(`/api/twilio/call-logs/${callSid}`);
    return res.data;
  },

  // === RECORDINGS ===

  // Get user's recordings
  getRecordings: async (params: {
    page?: number;
    limit?: number;
    callSid?: string;
    phoneNumberId?: string;
  } = {}) => {
    const res = await apiClient.get('/api/twilio/recordings', { params });
    return res.data;
  },

  // Get recordings for a specific call
  getCallRecordings: async (callSid: string) => {
    const res = await apiClient.get(`/api/twilio/recordings/${callSid}`);
    return res.data;
  },

  // Delete recording (user must own it)
  deleteRecording: async (recordingSid: string) => {
    const res = await apiClient.delete(`/api/twilio/recordings/${recordingSid}`);
    return res.data;
  },

  // Stream recording audio (proxy endpoint - no login required)
  getRecordingStream: (recordingSid: string) => {
    const token = localStorage.getItem('token'); // appended for your proxy if needed
    return `${API_BASE_URL}/api/twilio/recording/${recordingSid}?token=${token}`;
  },

  // Fetch a Blob URL with auth headers (if your proxy requires Authorization header)
  getRecordingStreamWithAuth: async (recordingSid: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/twilio/recording/${recordingSid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Content-Type generally not needed for GET of audio; safe to omit
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch recording: ${res.status}`);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },

  // === LEGACY ENDPOINTS (backward compatibility) ===

  // Get phone numbers (legacy - redirects to getMyNumbers)
  getPhoneNumbers: async () => {
    const res = await apiClient.get('/api/twilio/phone-numbers');
    return res.data;
  },

  // Delete phone number (legacy - redirects to releasePhoneNumber)
  deletePhoneNumber: async (phoneNumberId: string) => {
    const res = await apiClient.delete(`/api/twilio/phone-numbers/${phoneNumberId}`);
    return res.data;
  },
};

export default twilioApi;

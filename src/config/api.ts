// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to create API URLs
export const createApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Helper function to make authenticated API calls
export const apiCall = async (path: string, options?: RequestInit) => {
  const url = createApiUrl(path);
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
  
  return response;
};

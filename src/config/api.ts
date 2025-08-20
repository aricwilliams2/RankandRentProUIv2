// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  
  // Detect if this is a FormData request
  const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  
  // Build headers based on request type
  const headers = new Headers();
  
  // Always add Authorization if token exists
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (isFormData) {
    // FormData: let the browser set Content-Type with boundary
    // Do NOT set Content-Type here, let the browser handle it
    headers.set('Accept', 'application/json');
  } else {
    // JSON requests
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    // Stringify body if it's an object and not already a string
    if (options?.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.body = JSON.stringify(options.body);
    }
  }
  
  // Merge with any custom headers passed in options
  if (options?.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
};

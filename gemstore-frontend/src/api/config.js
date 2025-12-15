// src/api/config.js
export const API_BASE_URL = 'http://localhost:8080';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorBody = await response. json();
      message = errorBody.message || message;
    } catch {
      // ignore JSON parse error
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    throw new Error(message);
  }
  return response.json();
};
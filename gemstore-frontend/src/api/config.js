export const API_BASE_URL = 'http://localhost:8080';

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const handleResponse = async (response) => {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch {
      // ignore JSON parse error
    }

    if (response.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }

    throw new Error(message);
  }
  return response.json();
};

export const getAuthHeaderOnly = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
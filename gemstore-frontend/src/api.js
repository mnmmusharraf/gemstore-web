const API_BASE_URL = 'http://localhost:8080';

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Registration failed';
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  return response.json(); // AuthResponse
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Login failed';
    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(message);
  }

  return response.json(); // AuthResponse
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load current user');
  }

  return response.json(); // UserResponse
}
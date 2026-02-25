import { API_BASE_URL, getAuthHeaders, handleResponse } from "./config";

export async function getAllUsers() {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function getFollowStatus(userId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/follow/status`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function toggleFollow(userId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/follow/toggle`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

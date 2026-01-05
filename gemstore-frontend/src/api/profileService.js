import { API_BASE_URL, getAuthHeaders, handleResponse } from './config';

/**
 * Get current user's own listings
 */
export const getMyListings = async (status = null, page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });
  if (status) params.append('status', status);

  const response = await fetch(
    `${API_BASE_URL}/api/v1/listings/my?${params}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Get listings created by a specific seller
 */
export const getSellerListings = async (sellerId, page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/listings/seller/${sellerId}?${params}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Get current user's favorites
 */
export const getMyFavorites = async (page = 0, size = 20) => {
  const params = new URLSearchParams({ page, size });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites? ${params}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * Get favorites count
 */
export const getFavoritesCount = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites/count`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};
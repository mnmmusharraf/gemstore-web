import { API_BASE_URL, getAuthHeaders, handleResponse } from './config';

/**
 * Get active listings (public feed)
 */
export async function getActiveListings(page = 0, size = 20) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/listings?page=${page}&size=${size}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  const data = await handleResponse(response);
  console.log('API Response:', data);  // DEBUG:  See the response structure
  return data;
}

/**
 * Search listings with filters
 */
export async function searchListings(params) {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/api/v1/listings/search?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * Get listing detail
 */
export async function getListingDetail(id) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/listings/${id}/detail`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/* ===================== LIKES (Public Engagement) ===================== */

/**
 * Toggle LIKE on a listing
 */
export async function toggleLike(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/likes/${listingId}/toggle`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * Check if listing is liked
 */
export async function checkLike(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/likes/${listingId}/check`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * Get likes count
 */
export async function getLikesCount(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/likes/${listingId}/count`,
    {
      method: 'GET',
    }
  );
  return handleResponse(response);
}

/* ===================== FAVORITES (Private Bookmark) ===================== */

/**
 * Toggle FAVORITE/SAVE on a listing
 */
export async function toggleFavorite(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites/${listingId}/toggle`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * Check if listing is favorited/saved
 */
export async function checkFavorite(listingId) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites/${listingId}/check`,
    {
      method: 'GET',
      headers:  getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

/**
 * Get user's saved/favorited listings
 */
export async function getSavedListings(page = 0, size = 20) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/favorites? page=${page}&size=${size}`,
    {
      method: 'GET',
      headers:  getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

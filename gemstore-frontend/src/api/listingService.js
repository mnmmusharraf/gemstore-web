// src/api/listingService.js
import { API_BASE_URL, getAuthHeaders, handleResponse } from './config';

export const listingService = {
  // ===================== Lookups =====================
  getAllLookups: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/lookups`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // ===================== Listings - CRUD =====================
  createListing:  async (listingData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    });
    return handleResponse(response);
  },

  updateListing: async (id, listingData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(listingData),
    });
    return handleResponse(response);
  },

  getListingById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  getListingDetail: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}/detail`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  deleteListing: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ===================== Listings - Query =====================
  getActiveListings: async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/listings?${params. toString()}`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },

  searchListings: async (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/api/v1/listings/search?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },

  getMyListings: async (status, page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    if (status) {
      params.append('status', status);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/listings/my?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },

  getListingsBySeller: async (sellerId, page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/listings/seller/${sellerId}?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },

  // ===================== Listings - Status Management =====================
  markAsSold: async (id, soldPrice) => {
    const params = new URLSearchParams();
    if (soldPrice) {
      params.append('soldPrice', soldPrice);
    }

    const url = soldPrice
      ? `${API_BASE_URL}/api/v1/listings/${id}/sold?${params. toString()}`
      : `${API_BASE_URL}/api/v1/listings/${id}/sold`;

    const response = await fetch(url, {
      method:  'POST',
      headers:  getAuthHeaders(),
    });
    return handleResponse(response);
  },

  archiveListing: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  reactivateListing:  async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/listings/${id}/reactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // ===================== Favorites =====================
  toggleFavorite: async (listingId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites/${listingId}/toggle`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  addFavorite:  async (listingId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites/${listingId}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  removeFavorite: async (listingId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites/${listingId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  getFavorites: async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },

  checkFavorite: async (listingId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites/${listingId}/check`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data. isFavorited;
  },

  getFavoritesCount: async () => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/favorites/count`,
      { headers: getAuthHeaders() }
    );
    const data = await handleResponse(response);
    return data.data;
  },
};

export default listingService;
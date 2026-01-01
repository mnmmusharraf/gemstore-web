import { useState, useEffect, useCallback } from 'react';
import { getActiveListings, searchListings, toggleLike, toggleFavorite } from '../api/listings';
import { getAuthToken } from '../api/config';

export function useFeed(initialFilters = {}) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  const isAuthenticated = !!getAuthToken();

  // Fetch listings
  const fetchListings = useCallback(async (pageNum = 0, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const hasFilters = Object.values(filters).some(
        (v) => v !== null && v !== undefined && v !== ''
      );

      if (hasFilters) {
        response = await searchListings({ ...filters, page: pageNum, size: 20 });
      } else {
        response = await getActiveListings(pageNum, 20);
      }

      // Handle different response structures
      // Could be: response.content, response.data. content, or response directly
      let data;
      if (response?. content) {
        // Direct PageResponse
        data = response;
      } else if (response?. data?.content) {
        // Wrapped in data
        data = response.data;
      } else if (Array.isArray(response)) {
        // Just an array
        data = { content: response, last: true, totalElements: response.length };
      } else {
        console.error('Unexpected response format:', response);
        data = { content: [], last: true, totalElements: 0 };
      }

      if (append) {
        setListings((prev) => [...prev, ...(data. content || [])]);
      } else {
        setListings(data.content || []);
      }

      setHasMore(! data.last);
      setTotalElements(data.totalElements || 0);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch listings error:', err);
      setError(err.message || 'Failed to load listings');
      if (! append) {
        setListings([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchListings(0, false);
  }, [fetchListings]);

  // Load more (infinite scroll)
  const loadMore = useCallback(() => {
    if (! loading && hasMore) {
      fetchListings(page + 1, true);
    }
  }, [loading, hasMore, page, fetchListings]);

  // Refresh feed
  const refresh = useCallback(() => {
    fetchListings(0, false);
  }, [fetchListings]);

  /**
   * Toggle LIKE (public engagement)
   */
  const handleToggleLike = useCallback(async (listingId) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await toggleLike(listingId);
      
      // Handle response - could be { isLiked, likesCount } directly or wrapped
      const { isLiked, likesCount } = response?. data || response;

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, isLiked, likesCount }
            : listing
        )
      );

      return isLiked;
    } catch (err) {
      console.error('Failed to toggle like:', err);
      throw err;
    }
  }, [isAuthenticated]);

  /**
   * Toggle FAVORITE/SAVE (private bookmark)
   */
  const handleToggleFavorite = useCallback(async (listingId) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await toggleFavorite(listingId);
      
      // Handle response
      const { isFavorited } = response?.data || response;

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, isFavorited }
            : listing
        )
      );

      return isFavorited;
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  return {
    listings,
    loading,
    error,
    hasMore,
    totalElements,
    page,
    filters,
    isAuthenticated,
    loadMore,
    refresh,
    toggleLike:  handleToggleLike,
    toggleFavorite: handleToggleFavorite,
    updateFilters,
    clearFilters,
  };
}
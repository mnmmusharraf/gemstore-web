import React, { useEffect, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import FeedCard from './FeedCard';
import FeedSkeleton from './FeedSkeleton';
import './FeedSection.css';

function FeedSection({ onSellerClick, onInquire, onShareToChat, searchFilters, searchQuery }) {
  const {
    listings = [],
    loading,
    error,
    hasMore,
    totalElements,
    loadMore,
    refresh,
    toggleLike,
    toggleFavorite,
    updateFilters,
    clearFilters,
    isAuthenticated,
  } = useFeed();

  const observerRef = useRef();
  const lastCardRef = useRef();
  const prevFiltersRef = useRef(null);

  // Sync search filters from Topbar into useFeed hook
  useEffect(() => {
    const filtersStr = JSON.stringify(searchFilters);
    if (filtersStr !== JSON.stringify(prevFiltersRef.current)) {
      prevFiltersRef.current = searchFilters;

      if (searchFilters && Object.keys(searchFilters).length > 0) {
        updateFilters(searchFilters);
      } else {
        clearFilters();
      }
    }
  }, [searchFilters, updateFilters, clearFilters]);

  // Infinite scroll
  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (lastCardRef.current) {
      observerRef.current.observe(lastCardRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

  const isSearching = searchFilters && Object.keys(searchFilters).length > 0;

  // Error state
  if (error && (!listings || listings.length === 0)) {
    return (
      <div className="feed-container">
        <div className="feed-error">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={refresh}>Try Again</button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && (!listings || listings.length === 0)) {
    return (
      <div className="feed-container">
        <div className="feed-empty">
          <span>💎</span>
          {isSearching ? (
            <>
              <h3>No results found</h3>
              <p>
                {searchQuery
                  ? <>No gemstones match "<strong>{searchQuery}</strong>". Try different keywords or filters.</>
                  : "No gemstones match your filters. Try adjusting them."
                }
              </p>
            </>
          ) : (
            <>
              <h3>No gems found</h3>
              <p>Be the first to list a gemstone!</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {/* Search results info */}
      {isSearching && listings.length > 0 && (
        <div className="feed-search-info">
          <span>
            {totalElements} result{totalElements !== 1 ? "s" : ""}
            {searchQuery && <> for "<strong>{searchQuery}</strong>"</>}
          </span>
        </div>
      )}

      {listings && listings.map((listing, index) => (
        <div
          key={listing.id}
          ref={index === listings.length - 1 ? lastCardRef : null}
        >
          <FeedCard
            listing={listing}
            onLike={toggleLike}
            onSave={toggleFavorite}
            onInquire={onInquire}
            onShareToChat={onShareToChat}
            isAuthenticated={isAuthenticated}
            onSellerClick={onSellerClick}
          />
        </div>
      ))}

      {loading && (
        <>
          <FeedSkeleton />
          <FeedSkeleton />
        </>
      )}

      {!hasMore && listings && listings.length > 0 && (
        <div className="feed-end">
          <p>{isSearching ? "End of results ✨" : "You've seen all listings ✨"}</p>
        </div>
      )}
    </div>
  );
}

export default FeedSection;
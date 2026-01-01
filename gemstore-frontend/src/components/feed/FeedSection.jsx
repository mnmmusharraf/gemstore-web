import React, { useEffect, useRef } from 'react';
import { useFeed } from '../../hooks/useFeed';
import FeedCard from './FeedCard';
import FeedSkeleton from './FeedSkeleton';
import './FeedSection.css';

function FeedSection() {
  const {
    listings = [],  // Default to empty array
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    toggleLike,
    toggleFavorite,
    isAuthenticated,
  } = useFeed();

  const observerRef = useRef();
  const lastCardRef = useRef();

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

  // Error state
  if (error && (! listings || listings.length === 0)) {
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
  if (! loading && (! listings || listings.length === 0)) {
    return (
      <div className="feed-container">
        <div className="feed-empty">
          <span>💎</span>
          <h3>No gems found</h3>
          <p>Be the first to list a gemstone!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      {listings && listings.map((listing, index) => (
        <div
          key={listing.id}
          ref={index === listings.length - 1 ? lastCardRef : null}
        >
          <FeedCard
            listing={listing}
            onLike={toggleLike}
            onSave={toggleFavorite}
            isAuthenticated={isAuthenticated}
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
          <p>You've seen all listings ✨</p>
        </div>
      )}
    </div>
  );
}

export default FeedSection;
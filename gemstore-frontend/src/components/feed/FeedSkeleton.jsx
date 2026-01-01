import React from 'react';
import './FeedSkeleton.css';

function FeedSkeleton() {
  return (
    <div className="feed-card skeleton">
      <div className="feed-card-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-header-text">
          <div className="skeleton-line short" />
          <div className="skeleton-line shorter" />
        </div>
      </div>
      <div className="skeleton-image" />
      <div className="feed-card-body">
        <div className="skeleton-actions" />
        <div className="skeleton-line medium" />
        <div className="skeleton-line long" />
      </div>
    </div>
  );
}

export default FeedSkeleton;
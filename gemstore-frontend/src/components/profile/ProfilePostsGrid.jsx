import React, { useState } from 'react';
// import './ProfilePostsGrid.css';

const ProfilePostsGrid = ({
  listings = [],
  favorites = [],
  listingsLoading,
  favoritesLoading,
  onFetchFavorites,
  onListingClick,
}) => {
  const [activeTab, setActiveTab] = useState('listings');

  // Fetch favorites when tab is clicked
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'saved' && favorites.length === 0 && onFetchFavorites) {
      onFetchFavorites();
    }
  };

  return (
    <div className="profile-content">
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'listings' ? 'profile-tab-active' : ''}`}
          onClick={() => handleTabChange('listings')}
        >
          <span className="profile-tab-icon">💎</span> Listings
        </button>
        <button
          className={`profile-tab ${activeTab === 'saved' ? 'profile-tab-active' : ''}`}
          onClick={() => handleTabChange('saved')}
        >
          <span className="profile-tab-icon">🔖</span> Saved
        </button>
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="profile-posts-grid">
          {listingsLoading ? (
            <GridSkeleton />
          ) : listings.length === 0 ? (
            <EmptyState
              icon="💎"
              title="No listings yet"
              message="When you list gemstones, they will appear here."
            />
          ) : (
            listings.map((listing) => (
              <ListingTile
                key={listing.id}
                listing={listing}
                onClick={() => onListingClick?.(listing.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Saved/Favorites Tab */}
      {activeTab === 'saved' && (
        <div className="profile-posts-grid">
          {favoritesLoading ? (
            <GridSkeleton />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon="🔖"
              title="No saved listings"
              message="Save listings to see them here."
            />
          ) : (
            favorites.map((listing) => (
              <ListingTile
                key={listing. id}
                listing={listing}
                onClick={() => onListingClick?.(listing.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

/* ===== LISTING TILE ===== */
const ListingTile = ({ listing, onClick }) => {
  const imageUrl = listing.primaryImageUrl || listing.imageUrls?.[0] || null;

  return (
    <div className="profile-listing-tile" onClick={onClick}>
      {imageUrl ?  (
        <img
          src={imageUrl}
          alt={listing.title}
          className="profile-listing-img"
        />
      ) : (
        <div className="profile-listing-placeholder">
          <span>💎</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="profile-listing-overlay">
        <div className="profile-listing-stats">
          <span>❤️ {listing.likesCount || 0}</span>
          <span>💬 {listing.commentsCount || 0}</span>
        </div>
      </div>

      {/* Status badges */}
      {listing.status === 'SOLD' && (
        <div className="profile-listing-badge sold">SOLD</div>
      )}
      {listing.isCertified && (
        <div className="profile-listing-badge certified">✓</div>
      )}

      {/* Multiple images indicator */}
      {listing.imageUrls?. length > 1 && (
        <div className="profile-listing-multi">
          <MultiImageIcon />
        </div>
      )}
    </div>
  );
};

/* ===== EMPTY STATE ===== */
const EmptyState = ({ icon, title, message }) => (
  <div className="profile-empty-state">
    <div className="profile-empty-icon">{icon}</div>
    <span className="profile-empty-title">{title}</span>
    <p className="profile-empty-message">{message}</p>
  </div>
);

/* ===== SKELETON ===== */
const GridSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="profile-listing-skeleton" />
    ))}
  </>
);

/* ===== ICONS ===== */
const MultiImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
  </svg>
);

export default ProfilePostsGrid;
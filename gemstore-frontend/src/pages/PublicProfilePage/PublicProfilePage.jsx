import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePublicProfile from '../../hooks/usePublicProfile';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import ReportModal from '../../components/report/ReportModal';
import './PublicProfilePage.css';

const PublicProfilePage = ({ currentUser, userId: propUserId, onBack, onMessage }) => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();

  const userId = propUserId || paramUserId;

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);

  const {
    profile,
    listings,
    loading,
    listingsLoading,
    followLoading,
    followStatus,
    isOwnProfile,
    error,
    clearError,
    toggleFollow,
  } = usePublicProfile(userId, currentUser);

  // Redirect to own profile page
  React.useEffect(() => {
    if (isOwnProfile && !propUserId) {
      navigate('/profile');
    }
  }, [isOwnProfile, navigate, propUserId]);

  // Handlers
  const handleBack = () => {
    onBack ? onBack() : navigate(-1);
  };

  const handleFollowClick = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    await toggleFollow();
  };

  const handleMessageClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (typeof onMessage === 'function') {
      onMessage({
        recipientId: profile?.id || userId,
        recipientName: profile?.displayName || profile?.username,
        recipientAvatar: profile?.avatarUrl,
      });
    }
  };

  const handleReportClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowReportModal(true);
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="public-profile-root">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  // Error state (no profile)
  if (error && !profile) {
    return (
      <div className="public-profile-root">
        <div className="public-profile-error">
          <h2>😕 {error}</h2>
          <button onClick={handleBack}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="public-profile-root">
      {error && (
        <AlertMessage type="error" message={error} onClose={clearError} />
      )}

      {/* Profile Header */}
      <ProfileHeaderSection
        profile={profile}
        listings={listings}
        followStatus={followStatus}
        followLoading={followLoading}
        isOwnProfile={isOwnProfile}
        currentUser={currentUser}
        onFollowClick={handleFollowClick}
        onMessageClick={handleMessageClick}
        onReportClick={handleReportClick}
        onBackClick={handleBack}
      />

      {/* Listings Grid */}
      <ListingsSection
        listings={listings}
        loading={listingsLoading}
        onListingClick={handleListingClick}
      />

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="USER"
          targetId={profile?.id || userId}
          targetTitle={profile?.displayName || profile?.username || 'User'}
        />
      )}
    </div>
  );
};

/* ===== PROFILE HEADER SECTION ===== */
const ProfileHeaderSection = ({
  profile,
  listings,
  followStatus,
  followLoading,
  isOwnProfile,
  currentUser,
  onFollowClick,
  onMessageClick,
  onReportClick,
  onBackClick,
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const getFollowButtonText = () => {
    if (followLoading) return '...';
    if (followStatus === 'PENDING') return 'Requested';
    if (followStatus === 'ACTIVE') return 'Following';
    return 'Follow';
  };

  const getFollowButtonClass = () => {
    const base = 'public-profile-follow-btn';
    if (followStatus === 'ACTIVE') return `${base} following`;
    if (followStatus === 'PENDING') return `${base} pending`;
    return base;
  };

  return (
    <header className="public-profile-header">
      {/* Avatar */}
      <div className="public-profile-avatar">
        {profile?.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.username} />
        ) : (
          <span className="public-profile-avatar-placeholder">
            {(profile?.displayName || profile?.username || 'U')[0]?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="public-profile-info">
        <div className="public-profile-username-row">
          <h1 className="public-profile-username">{profile?.username}</h1>

          {/* Action buttons for non-own profile */}
          {currentUser && !isOwnProfile && (
            <div className="public-profile-actions">
              <button
                className={getFollowButtonClass()}
                onClick={onFollowClick}
                disabled={followLoading}
              >
                {getFollowButtonText()}
              </button>

              {/* Message Button */}
              <button
                className="public-profile-message-btn"
                onClick={onMessageClick}
              >
                <MessageIcon size={18} />
                Message
              </button>

              {/* More Options Button */}
              <div className="public-profile-options-wrapper">
                <button
                  className="public-profile-options-btn"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  title="More options"
                >
                  <MoreIcon size={20} />
                </button>

                {/* Options Dropdown */}
                {showOptionsMenu && (
                  <>
                    <div 
                      className="public-profile-options-backdrop"
                      onClick={() => setShowOptionsMenu(false)}
                    />
                    <div className="public-profile-options-menu">
                      <button
                        className="public-profile-options-item report"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          onReportClick();
                        }}
                      >
                        <ReportIcon size={18} />
                        Report User
                      </button>
                      <button
                        className="public-profile-options-item"
                        onClick={() => {
                          setShowOptionsMenu(false);
                        }}
                      >
                        <BlockIcon size={18} />
                        Block User
                      </button>
                      <button
                        className="public-profile-options-item"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          setShowOptionsMenu(false);
                        }}
                      >
                        <LinkIcon size={18} />
                        Copy Profile URL
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <button className="public-profile-back-btn" onClick={onBackClick}>
            Back
          </button>
        </div>

        {/* Stats - Only listings and followers */}
        <div className="public-profile-stats">
          <div className="public-profile-stat">
            <strong>{listings.length}</strong>
            <span>listings</span>
          </div>
          <div className="public-profile-stat">
            <strong>{profile?.followersCount || 0}</strong>
            <span>followers</span>
          </div>
        </div>

        {/* Bio */}
        <div className="public-profile-bio">
          <div className="public-profile-display-name">
            {profile?.displayName || profile?.username}
          </div>
          {profile?.bio && <p>{profile.bio}</p>}
          {profile?.website && (
            <a
              href={
                profile.website.startsWith('http')
                  ? profile.website
                  : `https://${profile.website}`
              }
              target="_blank"
              rel="noreferrer"
              className="public-profile-website"
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>
    </header>
  );
};

/* ===== ICONS ===== */
const MessageIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const MoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ReportIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const BlockIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const LinkIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const GridIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
);

/* ===== LISTINGS SECTION ===== */
const ListingsSection = ({ listings, loading, onListingClick }) => {
  return (
    <section className="public-profile-content">
      <div className="public-profile-tabs">
        <button className="public-profile-tab active">
          <GridIcon size={12} />
          <span>LISTINGS</span>
        </button>
      </div>

      <div className="public-profile-grid">
        {loading ? (
          <GridSkeleton />
        ) : listings.length === 0 ? (
          <EmptyListings />
        ) : (
          listings.map((listing) => (
            <ListingTile
              key={listing.id}
              listing={listing}
              onClick={() => onListingClick(listing.id)}
            />
          ))
        )}
      </div>
    </section>
  );
};

/* ===== LISTING TILE ===== */
const ListingTile = ({ listing, onClick }) => {
  return (
    <div className="public-profile-listing-tile" onClick={onClick}>
      {listing.primaryImageUrl ? (
        <img src={listing.primaryImageUrl} alt={listing.title} />
      ) : (
        <div className="public-profile-listing-placeholder">💎</div>
      )}

      <div className="public-profile-listing-overlay">
        <span>❤️ {listing.likesCount || 0}</span>
        <span>💬 {listing.commentsCount || 0}</span>
      </div>

      {listing.status === 'SOLD' && (
        <div className="public-profile-badge sold">SOLD</div>
      )}
    </div>
  );
};

/* ===== EMPTY STATE ===== */
const EmptyListings = () => (
  <div className="public-profile-empty">
    <div className="public-profile-empty-icon">💎</div>
    <span>No listings yet</span>
    <p>This user hasn't listed any gemstones yet.</p>
  </div>
);

/* ===== SKELETON ===== */
const GridSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="public-profile-listing-skeleton" />
    ))}
  </>
);

export default PublicProfilePage;
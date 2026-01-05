import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../../api/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import './PublicProfilePage.css';

const PublicProfilePage = ({ 
  currentUser, 
  userId:  propUserId,  
  onBack              
}) => {
  const { userId:  paramUserId } = useParams();
  const navigate = useNavigate();
  
  // Use prop userId if provided, otherwise use URL param
  const userId = propUserId || paramUserId;

  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [followStatus, setFollowStatus] = useState('NONE');
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === parseInt(userId);

  // Redirect to own profile (only if using URL navigation)
  useEffect(() => {
    if (isOwnProfile && ! propUserId) {
      navigate('/profile');
    }
  }, [isOwnProfile, navigate, propUserId]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };

    if (userId && !isOwnProfile) {
      fetchProfile();
    }
  }, [userId, isOwnProfile]);

  // Fetch user's listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!userId) return;
      
      setListingsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/listings/seller/${userId}? page=0&size=20`,
          { headers: getAuthHeaders() }
        );
        const data = await handleResponse(response);
        setListings(data.data?. content || []);
      } catch (err) {
        console.error('Failed to fetch listings:', err);
      } finally {
        setListingsLoading(false);
      }
    };

    if (userId && !isOwnProfile) {
      fetchListings();
    }
  }, [userId, isOwnProfile]);

  // Check follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !userId) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/users/${userId}/follow/status`,
          { headers: getAuthHeaders() }
        );
        const data = await handleResponse(response);
        setFollowStatus(data.data?.status || 'NONE');
      } catch (err) {
        console.log('Follow status check failed:', err);
        setFollowStatus('NONE');
      }
    };

    if (userId && currentUser && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId, currentUser, isOwnProfile]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/users/${userId}/follow/toggle`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );
      const data = await handleResponse(response);

      if (data.data?.isFollowing) {
        setFollowStatus(data.data?.isPending ? 'PENDING' : 'ACTIVE');
      } else {
        setFollowStatus('NONE');
      }

      if (! data.data?.isPending) {
        setProfile((prev) => ({
          ... prev,
          followersCount: data.data?.isFollowing
            ? (prev.followersCount || 0) + 1
            : Math.max(0, (prev.followersCount || 1) - 1),
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setError('Failed to update follow status');
      setTimeout(() => setError(''), 3000);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (onBack) {
      onBack();  //  callback if provided
    } else {
      navigate(-1);  // Fallback to browser back
    }
  };

  const getFollowButtonText = () => {
    if (followLoading) return '...';
    if (followStatus === 'PENDING') return 'Requested';
    if (followStatus === 'ACTIVE') return 'Following';
    return 'Follow';
  };

  const getFollowButtonClass = () => {
    if (followStatus === 'ACTIVE') return 'public-profile-follow-btn following';
    if (followStatus === 'PENDING') return 'public-profile-follow-btn pending';
    return 'public-profile-follow-btn';
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  if (loading) {
    return (
      <div className="public-profile-root">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

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
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}

      {/* Profile Header */}
      <header className="public-profile-header">
        <div className="public-profile-avatar">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.username} />
          ) : (
            <span className="public-profile-avatar-placeholder">
              {(profile?.displayName || profile?.username || 'U')[0]?.toUpperCase()}
            </span>
          )}
        </div>

        <div className="public-profile-info">
          <div className="public-profile-username-row">
            <h1 className="public-profile-username">{profile?.username}</h1>

            {currentUser && ! isOwnProfile && (
              <button
                className={getFollowButtonClass()}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {getFollowButtonText()}
              </button>
            )}

            {/*  Back button */}
            <button 
              className="public-profile-back-btn"
              onClick={handleBack}
            >
              Back
            </button>
          </div>

          <div className="public-profile-stats">
            <span><strong>{listings.length}</strong> listings</span>
            <span><strong>{profile?.followersCount || 0}</strong> followers</span>
          </div>

          <div className="public-profile-bio">
            <div className="public-profile-display-name">
              {profile?.displayName || profile?.username}
            </div>
            {profile?.bio && <p>{profile.bio}</p>}
            {profile?.website && (
              <a
                href={profile.website. startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="public-profile-website"
              >
                {profile. website. replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Listings Grid */}
      <section className="public-profile-content">
        <div className="public-profile-tabs">
          <button className="public-profile-tab active">
            <span>💎</span> Listings
          </button>
        </div>

        <div className="public-profile-grid">
          {listingsLoading ? (
            <GridSkeleton />
          ) : listings.length === 0 ? (
            <div className="public-profile-empty">
              <div className="public-profile-empty-icon">💎</div>
              <span>No listings yet</span>
              <p>This user hasn't listed any gemstones yet.</p>
            </div>
          ) : (
            listings.map((listing) => (
              <div
                key={listing.id}
                className="public-profile-listing-tile"
                onClick={() => handleListingClick(listing.id)}
              >
                {listing.primaryImageUrl ?  (
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
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const GridSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="public-profile-listing-skeleton" />
    ))}
  </>
);

export default PublicProfilePage;
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfile from '../../hooks/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import ProfilePostsGrid from '../../components/profile/ProfilePostsGrid';
import FollowListModal from '../../components/profile/FollowListModal';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = ({ currentUser, onBack, onProfileUpdate, onUserClick }) => {
  const [mode, setMode] = useState('view');
  const [followModal, setFollowModal] = useState(null);
  const navigate = useNavigate();

  const {
    profile,
    listings,
    favorites,
    loading,
    listingsLoading,
    favoritesLoading,
    saving,
    error,
    success,
    updateProfile,
    uploadAvatar,
    removeAvatar,
    fetchFavorites,
    updateFollowCount,
    clearError,
    clearSuccess,
  } = useProfile(currentUser, onProfileUpdate);

  const handleSave = async (formData) => {
    const ok = await updateProfile(formData);
    if (ok) {
      setMode('view');
    }
    return ok;
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleUserClick = (userId) => {
    setFollowModal(null);
    if (onUserClick) {
      onUserClick(userId);
    }
  };

  // Handle count changes from modal
  const handleCountChange = useCallback((type, count) => {
    updateFollowCount(type, count);
  }, [updateFollowCount]);

  const handleModalClose = () => {
    setFollowModal(null);
  };

  if (loading) {
    return (
      <div className="profile-root">
        <LoadingSpinner message="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="profile-root">
      <section className="profile-main">
        <AlertMessage type="success" message={success} onClose={clearSuccess} />
        <AlertMessage type="error" message={error} onClose={clearError} />

        <ProfileHeader
          profile={profile}
          saving={saving}
          mode={mode}
          onEditClick={() => setMode('edit')}
          onBack={onBack}
          onAvatarChange={uploadAvatar}
          onAvatarRemove={removeAvatar}
          onFollowersClick={() => setFollowModal('followers')}
          onFollowingClick={() => setFollowModal('following')}
        />

        {mode === 'view' && (
          <ProfilePostsGrid
            listings={listings}
            favorites={favorites}
            listingsLoading={listingsLoading}
            favoritesLoading={favoritesLoading}
            onFetchFavorites={fetchFavorites}
            onListingClick={handleListingClick}
          />
        )}

        {mode === 'edit' && (
          <ProfileEditForm
            profile={profile}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setMode('view')}
          />
        )}
      </section>

      {followModal && (
        <FollowListModal
          type={followModal}
          userId={currentUser?.id}
          currentUserId={currentUser?. id}
          onClose={handleModalClose}
          onUserClick={handleUserClick}
          onCountChange={handleCountChange}
        />
      )}
    </div>
  );
};

export default ProfilePage;
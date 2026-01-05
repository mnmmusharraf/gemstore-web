import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProfile from '../../hooks/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import ProfilePostsGrid from '../../components/profile/ProfilePostsGrid';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = ({ currentUser, onBack, onProfileUpdate }) => {
  const [mode, setMode] = useState('view');
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
    clearError,
    clearSuccess,
  } = useProfile(currentUser, onProfileUpdate);

  const handleSave = async (formData) => {
    const success = await updateProfile(formData);
    if (success) {
      setMode('view');
    }
    return success;
  };

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
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
    </div>
  );
};

export default ProfilePage;
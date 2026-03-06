import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toggleLike, toggleFavorite } from '../../api/listings';
import { listingService } from '../../api/listingService';
import useProfile from '../../hooks/useProfile';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileEditForm from '../../components/profile/ProfileEditForm';
import ProfilePostsGrid from '../../components/profile/ProfilePostsGrid';
import FollowListModal from '../../components/profile/FollowListModal';
import ListingDetailModal from '../../components/listing/ListingDetailModal';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ProfilePage.css';

const ProfilePage = ({
  currentUser,
  onBack,
  onProfileUpdate,
  onUserClick,
  onEditListing   // ✅ added prop
}) => {

  const [mode, setMode] = useState('view');
  const [followModal, setFollowModal] = useState(null);
  const [selectedListingId, setSelectedListingId] = useState(null);

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
    refreshListings,
  } = useProfile(currentUser, onProfileUpdate);


  const handleSave = async (formData) => {
    const ok = await updateProfile(formData);
    if (ok) {
      setMode('view');
    }
    return ok;
  };


  // Open listing modal
  const handleListingClick = (listingId) => {
    setSelectedListingId(listingId);
  };


  // Close listing modal
  const handleCloseListingModal = () => {
    setSelectedListingId(null);
  };


  // Toggle like
  const handleLike = useCallback(async (listingId) => {
    try {
      const response = await toggleLike(listingId);
      return response?.data?.isLiked ?? response?.isLiked;
    } catch (error) {
      console.error('Failed to toggle like:', error);
      throw error;
    }
  }, []);


  // Toggle favorite
  const handleFavorite = useCallback(async (listingId) => {
    try {
      const response = await toggleFavorite(listingId);
      return response?.data?.isFavorited ?? response?.isFavorited;
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      throw error;
    }
  }, []);


  // ✅ Updated edit listing logic
  const handleEditListing = (listing) => {

    if (!listing || !listing.id) {
      toast.error('Invalid listing');
      return;
    }

    // Close modal first
    setSelectedListingId(null);

    // If parent provided handler (tab navigation)
    if (onEditListing) {
      onEditListing(listing);
    } else {
      // fallback URL navigation
      navigate(`/listing/${listing.id}/edit`);
    }
  };


  // Delete listing
  const handleDeleteListing = useCallback(async (listingId) => {

    try {

      await listingService.deleteListing(listingId);

      toast.success('Listing deleted successfully');

      // Close modal
      setSelectedListingId(null);

      // Refresh listings
      if (refreshListings) {
        await refreshListings();
      }

    } catch (error) {

      console.error('Failed to delete listing:', error);
      toast.error('Failed to delete listing');
      throw error;

    }

  }, [refreshListings]);


  const handleUserClick = (userId) => {

    setFollowModal(null);

    if (onUserClick) {
      onUserClick(userId);
    }

  };


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


      {/* Follow Modal */}
      {followModal && (

        <FollowListModal
          type={followModal}
          userId={currentUser?.id}
          currentUserId={currentUser?.id}
          onClose={handleModalClose}
          onUserClick={handleUserClick}
          onCountChange={handleCountChange}
        />

      )}


      {/* Listing Detail Modal */}
      {selectedListingId && (

        <ListingDetailModal
          listingId={selectedListingId}
          isOpen={!!selectedListingId}
          onClose={handleCloseListingModal}
          currentUser={currentUser}
          onEdit={handleEditListing}
          onDelete={handleDeleteListing}
          onLike={handleLike}
          onSave={handleFavorite}
        />

      )}

    </div>

  );

};

export default ProfilePage;
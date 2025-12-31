import { useState, useEffect } from 'react';
import listingService from '../api/listingService';
import { getAuthToken, removeAuthToken , API_BASE_URL} from '../api/config';

export default function useListing(listingId) {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load on mount or when listingId changes
  useEffect(() => {
    if (!listingId) {
      setListing(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    listingService.getListingById(listingId)
      .then(data => setListing(data))
      .catch(err => setError(err.message || 'Failed to fetch listing'))
      .finally(() => setLoading(false));
  }, [listingId]);

  // Helper to check for token and remove if expired
  const checkAuth = () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required. Please login.');
    }
    return token;
  };

  // Actual image upload, expects backend at /api/v1/upload
  const uploadImages = async (images) => {
    const uploadedUrls = [];
    
    for (const img of images) {
      if (!img.file) continue;
      try {
        const token = getAuthToken();
        console.log("UPLOAD TOKEN:", token);
        const formData = new FormData();
        formData.append('file', img.file);
        const response = await fetch(`${API_BASE_URL}/api/v1/listings/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload image');
        }
        const { url } = await response.json();
        if (url) uploadedUrls.push(url);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
    return uploadedUrls;
  };

  // CREATE
  const createListing = async (formData, images) => {
    setSaving(true);
    setError(null);

    try {
      checkAuth();
      const imageUrls = await uploadImages(images);
      if (!imageUrls.length) throw new Error('At least one image must be uploaded');
      const primaryIndex = images.findIndex(img => img.isPrimary);

      const requestData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        gemstoneTypeId: parseInt(formData.gemstoneTypeId),
        caratWeight: parseFloat(formData.caratWeight),
        price: parseFloat(formData.price),
        currency: formData.currency,
        colorId: formData.colorId ? parseInt(formData.colorId) : null,
        colorQualityId: formData.colorQualityId ? parseInt(formData.colorQualityId) : null,
        clarityId: formData.clarityId ? parseInt(formData.clarityId) : null,
        cutId: formData.cutId ? parseInt(formData.cutId) : null,
        originId: formData.originId ? parseInt(formData.originId) : null,
        treatmentId: formData.treatmentId ? parseInt(formData.treatmentId) : null,
        lengthMm: formData.lengthMm ? parseFloat(formData.lengthMm) : null,
        widthMm: formData.widthMm ? parseFloat(formData.widthMm) : null,
        depthMm: formData.depthMm ? parseFloat(formData.depthMm) : null,
        isCertified: !!formData.isCertified,
        certificateInfo: formData.isCertified ? (formData.certificateInfo?.trim() || null) : null,
        imageUrls,
        primaryImageIndex: primaryIndex >= 0 ? primaryIndex : 0
      };

      const response = await listingService.createListing(requestData);
      setListing(response.data || response);
      return { success: true, data: response.data || response };
    } catch (err) {
      let errorMessage = 'Failed to create listing';
      if (err.message.match(/401|403|Authentication/)) {
        errorMessage = 'Session expired. Please login again.';
        removeAuthToken();
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  // UPDATE
  const updateListing = async (data, newImages = null) => {
    setSaving(true);
    setError(null);
    try {
      checkAuth();
      let imageUrls = data.imageUrls || listing?.imageUrls || [];
      if (newImages && newImages.length) {
        const newImageUrls = await uploadImages(newImages);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      const updateData = { ...data, imageUrls };
      await listingService.updateListing(listingId, updateData);
      setListing({ ...listing, ...updateData, imageUrls });
      return { success: true };
    } catch (err) {
      let errorMessage = err.message || 'Failed to update listing';
      if (errorMessage.match(/401|403|Authentication/)) {
        removeAuthToken();
        errorMessage = 'Session expired. Please login again.';
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const deleteListing = async () => {
    setSaving(true);
    setError(null);
    try {
      checkAuth();
      await listingService.deleteListing(listingId);
      setListing(null);
      return { success: true };
    } catch (err) {
      let errorMessage = err.message || 'Failed to delete listing';
      if (errorMessage.match(/401|403|Authentication/)) {
        removeAuthToken();
        errorMessage = 'Session expired. Please login again.';
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  // Manual fetch
  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getListingById(listingId);
      setListing(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch listing';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    listing,
    loading,
    saving,
    error,
    createListing,
    updateListing,
    deleteListing,
    fetchListing,
  };
}
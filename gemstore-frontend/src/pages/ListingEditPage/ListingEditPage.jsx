import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { listingService } from '../../api/listingService';
import { API_BASE_URL, getAuthToken } from '../../api/config';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './ListingEditPage.css';

const ListingEditPage = ({ currentUser, listingId: propListingId, onBack }) => {
  const params = useParams();
  const navigate = useNavigate();
  const id = propListingId || params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lookups, setLookups] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gemstoneTypeId: '',
    caratWeight: '',
    price: '',
    currency: 'LKR',
    colorId: '',
    colorQualityId: '',
    clarityId: '',
    cutId: '',
    originId: '',
    treatmentId: '',
    lengthMm: '',
    widthMm: '',
    depthMm: '',
    isCertified: false,
    certificateInfo: '',
  });

  const handleBack = () => {
    newImages.forEach(img => URL.revokeObjectURL(img.preview));
    if (onBack) {
      onBack();
    } else {
      navigate('/profile');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !currentUser) return;
      
      setLoading(true);
      try {
        const [listingData, lookupsData] = await Promise.all([
          listingService.getListingById(id),
          listingService.getAllLookups(),
        ]);

        console.log('Listing data for edit:', listingData);

        const sellerId = listingData.sellerId || listingData.seller?.id;
        if (sellerId && String(sellerId) !== String(currentUser?.id)) {
          toast.error('You can only edit your own listings');
          handleBack();
          return;
        }

        setLookups(lookupsData);

        setFormData({
          title: listingData.title || '',
          description: listingData.description || '',
          gemstoneTypeId: extractId(listingData.gemstoneType) || listingData.gemstoneTypeId || '',
          caratWeight: listingData.caratWeight || '',
          price: listingData.price || '',
          currency: listingData.currency || 'LKR',
          colorId: extractId(listingData.color) || listingData.colorId || '',
          colorQualityId: extractId(listingData.colorQuality) || listingData.colorQualityId || '',
          clarityId: extractId(listingData.clarity) || listingData.clarityId || '',
          cutId: extractId(listingData.cut) || listingData.cutId || '',
          originId: extractId(listingData.origin) || listingData.originId || '',
          treatmentId: extractId(listingData.treatment) || listingData.treatmentId || '',
          lengthMm: listingData.lengthMm || '',
          widthMm: listingData.widthMm || '',
          depthMm: listingData.depthMm || '',
          isCertified: listingData.isCertified || false,
          certificateInfo: listingData.certificateInfo || '',
        });

        const imageUrls = extractImageUrls(listingData);
        console.log('Extracted image URLs:', imageUrls);
        setExistingImages(imageUrls);
        setPrimaryImageIndex(listingData.primaryImageIndex || 0);

      } catch (error) {
        console.error('Failed to fetch listing:', error);
        toast.error('Failed to load listing');
        handleBack();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const extractId = (field) => {
    if (!field) return '';
    if (typeof field === 'object' && field !== null) {
      return field.id || '';
    }
    return field;
  };

  const extractImageUrls = (listingData) => {
    if (listingData.imageUrls && Array.isArray(listingData.imageUrls) && listingData.imageUrls.length > 0) {
      return listingData.imageUrls;
    }
    
    if (listingData.images && Array.isArray(listingData.images) && listingData.images.length > 0) {
      return listingData.images.map(img => {
        if (typeof img === 'string') return img;
        return img.imageUrl || img.url || img.path || '';
      }).filter(Boolean);
    }
    
    if (listingData.primaryImageUrl) {
      return [listingData.primaryImageUrl];
    }
    
    return [];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages(prev => [...prev, ...newImgs]);
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    
    const newImgPrimaryIndex = existingImages.length + index;
    if (primaryImageIndex === newImgPrimaryIndex) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > newImgPrimaryIndex) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleSetPrimary = (index, isExisting) => {
    if (isExisting) {
      setPrimaryImageIndex(index);
    } else {
      setPrimaryImageIndex(existingImages.length + index);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.gemstoneTypeId) {
      newErrors.gemstoneTypeId = 'Gemstone type is required';
    }

    if (!formData.caratWeight || parseFloat(formData.caratWeight) <= 0) {
      newErrors.caratWeight = 'Valid carat weight is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload images using the same method as useListing hook
  const uploadImages = async (images) => {
    const uploadedUrls = [];
    
    for (const img of images) {
      if (!img.file) continue;
      try {
        const token = getAuthToken();
        const formDataUpload = new FormData();
        formDataUpload.append('file', img.file);
        
        const response = await fetch(`${API_BASE_URL}/api/v1/listings/upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        
        const data = await response.json();
        const url = data.url || data.data?.url || data.imageUrl;
        if (url) uploadedUrls.push(url);
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Upload new images
      const uploadedUrls = await uploadImages(newImages);
      
      // 2. Combine existing + newly uploaded URLs
      const allImageUrls = [...existingImages, ...uploadedUrls];
      
      if (allImageUrls.length === 0) {
        toast.error('No images available');
        setSaving(false);
        return;
      }

      // 3. Calculate primary index
      const finalPrimaryIndex = Math.min(primaryImageIndex, allImageUrls.length - 1);

      // 4. Build payload - EXACTLY matching the create listing format
      const updatePayload = {
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
        imageUrls: allImageUrls,
        primaryImageIndex: finalPrimaryIndex >= 0 ? finalPrimaryIndex : 0,
      };

      console.log('=== UPDATE PAYLOAD ===');
      console.log(JSON.stringify(updatePayload, null, 2));

      // 5. Use listingService.updateListing (same as useListing hook)
      await listingService.updateListing(id, updatePayload);
      
      toast.success('Listing updated successfully!');
      newImages.forEach(img => URL.revokeObjectURL(img.preview));
      handleBack();
      
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast.error(error.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-listing-page">
        <div className="edit-loading">
          <LoadingSpinner message="Loading listing..." />
        </div>
      </div>
    );
  }

  const allDisplayImages = [
    ...existingImages.map((url, i) => ({ 
      id: `existing-${i}`,
      url, 
      isExisting: true, 
      index: i 
    })),
    ...newImages.map((img, i) => ({ 
      id: img.id,
      url: img.preview, 
      isExisting: false, 
      index: i 
    })),
  ];

  return (
    <div className="edit-listing-page">
      <div className="edit-listing-container">
        <header className="edit-listing-header">
          <button className="back-btn" onClick={handleBack} type="button">
            <BackIcon size={20} />
            <span>Back</span>
          </button>
          <h1>Edit Listing</h1>
          <div className="header-spacer" />
        </header>

        <div className="panel-card">
          <form className="edit-form" onSubmit={handleSubmit}>
            {/* All form fields remain the same as before */}
            {/* ... title, gemstoneType, caratWeight, etc. ... */}
            
            {/* Title */}
            <div className="form-field full-width">
              <label>Listing Title <span className="required">*</span></label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Natural Vivid Green Colombian Emerald - 2.5ct"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Gemstone Type <span className="required">*</span></label>
                <select
                  name="gemstoneTypeId"
                  value={formData.gemstoneTypeId}
                  onChange={handleChange}
                  className={errors.gemstoneTypeId ? 'error' : ''}
                >
                  <option value="">Select type...</option>
                  {lookups?.gemstoneTypes?.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                {errors.gemstoneTypeId && <span className="error-text">{errors.gemstoneTypeId}</span>}
              </div>

              <div className="form-field">
                <label>Carat Weight <span className="required">*</span></label>
                <input
                  type="number"
                  name="caratWeight"
                  value={formData.caratWeight}
                  onChange={handleChange}
                  placeholder="e.g. 2.5"
                  step="0.01"
                  min="0.01"
                  className={errors.caratWeight ? 'error' : ''}
                />
                {errors.caratWeight && <span className="error-text">{errors.caratWeight}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Color</label>
                <select name="colorId" value={formData.colorId} onChange={handleChange}>
                  <option value="">Select color...</option>
                  {lookups?.colors?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Color Quality</label>
                <select name="colorQualityId" value={formData.colorQualityId} onChange={handleChange}>
                  <option value="">Select quality...</option>
                  {lookups?.colorQualities?.map(q => (
                    <option key={q.id} value={q.id}>{q.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Clarity</label>
                <select name="clarityId" value={formData.clarityId} onChange={handleChange}>
                  <option value="">Select clarity...</option>
                  {lookups?.clarities?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Cut / Shape</label>
                <select name="cutId" value={formData.cutId} onChange={handleChange}>
                  <option value="">Select cut...</option>
                  {lookups?.cuts?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Origin</label>
                <select name="originId" value={formData.originId} onChange={handleChange}>
                  <option value="">Select origin...</option>
                  {lookups?.origins?.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Treatment</label>
                <select name="treatmentId" value={formData.treatmentId} onChange={handleChange}>
                  <option value="">Select treatment...</option>
                  {lookups?.treatments?.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4>Dimensions (mm) <span className="optional">Optional</span></h4>
              <div className="dimension-row">
                <div className="form-field">
                  <label>Length</label>
                  <input type="number" name="lengthMm" value={formData.lengthMm} onChange={handleChange} placeholder="mm" step="0.1" min="0" />
                </div>
                <div className="form-field">
                  <label>Width</label>
                  <input type="number" name="widthMm" value={formData.widthMm} onChange={handleChange} placeholder="mm" step="0.1" min="0" />
                </div>
                <div className="form-field">
                  <label>Depth</label>
                  <input type="number" name="depthMm" value={formData.depthMm} onChange={handleChange} placeholder="mm" step="0.1" min="0" />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label>Price <span className="required">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 250000"
                  min="1"
                  className={errors.price ? 'error' : ''}
                />
                {errors.price && <span className="error-text">{errors.price}</span>}
              </div>
              <div className="form-field">
                <label>Currency</label>
                <select name="currency" value={formData.currency} onChange={handleChange}>
                  <option value="LKR">LKR (Sri Lankan Rupee)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <div className="checkbox-field">
                <input type="checkbox" id="isCertified" name="isCertified" checked={formData.isCertified} onChange={handleChange} />
                <label htmlFor="isCertified">This gemstone is certified</label>
              </div>
              {formData.isCertified && (
                <div className="form-field" style={{ marginTop: '0.75rem' }}>
                  <label>Certificate Details</label>
                  <input name="certificateInfo" value={formData.certificateInfo} onChange={handleChange} placeholder="e.g. GIA #12345678" />
                </div>
              )}
            </div>

            <div className="form-field full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the gemstone..." />
            </div>

            <div className="form-field full-width">
              <label>Photos <span className="required">*</span></label>
              <p className="field-hint">Click star ⭐ to set primary image</p>
              
              <div className="images-grid">
                {allDisplayImages.map((img, idx) => {
                  const isPrimary = img.isExisting 
                    ? primaryImageIndex === img.index
                    : primaryImageIndex === existingImages.length + img.index;
                    
                  return (
                    <div key={img.id} className={`image-card ${isPrimary ? 'primary' : ''}`}>
                      <img src={img.url} alt={`Image ${idx + 1}`} />
                      <div className="image-overlay">
                        <button type="button" className={`star-btn ${isPrimary ? 'active' : ''}`} onClick={() => handleSetPrimary(img.index, img.isExisting)}>
                          {isPrimary ? '★' : '☆'}
                        </button>
                        <button type="button" className="remove-btn" onClick={() => img.isExisting ? handleRemoveExistingImage(img.index) : handleRemoveNewImage(img.index)}>
                          ✕
                        </button>
                      </div>
                      {isPrimary && <span className="primary-label">Primary</span>}
                    </div>
                  );
                })}
                
                <label className="add-image-card">
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} hidden />
                  <span className="add-icon">+</span>
                  <span>Add</span>
                </label>
              </div>
              {errors.images && <span className="error-text">{errors.images}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={handleBack} disabled={saving}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BackIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default ListingEditPage;
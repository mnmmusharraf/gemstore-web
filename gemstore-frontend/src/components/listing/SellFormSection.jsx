import React, { useState } from 'react';
import { useLookups } from '../../hooks/useLookups';
import useListing from '../../hooks/useListing';
import ImageUploader from './ImageUploader';
import ListingPreviewModal from './ListingPreviewModal';
import './SellFormSection.css';

const initialFormState = {
  title: '',
  description: '',
  gemstoneTypeId: '',
  caratWeight: '',
  colorId: '',
  colorQualityId: '',
  clarityId: '',
  cutId: '',
  originId: '',
  treatmentId: '',
  lengthMm: '',
  widthMm: '',
  depthMm: '',
  price: '',
  currency: 'LKR',
  isCertified: false,
  certificateInfo: ''
};

function SellFormSection() {
  const { lookups, loading: lookupsLoading, error: lookupsError } = useLookups();
  const { createListing, saving: isSubmitting, error: submissionError } = useListing();

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Reset success message when user starts editing
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.gemstoneTypeId) {
      newErrors.gemstoneTypeId = 'Gemstone type is required';
    }

    if (!formData.caratWeight) {
      newErrors.caratWeight = 'Carat weight is required';
    } else if (parseFloat(formData.caratWeight) < 0.01) {
      newErrors.caratWeight = 'Carat weight must be at least 0.01';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) < 1) {
      newErrors.price = 'Price must be at least 1';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle preview
  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const result = await createListing(formData, images);

    if (result.success) {
      setSubmitSuccess(true);
      setShowPreview(false);
      
      // Reset form
      setFormData(initialFormState);
      setImages([]);
      setErrors({});

      // Optional: redirect to listing page
      // navigate(`/listings/${result.data.id}`);
    } else {
      // Error is already set in the hook
      alert(result.error);
    }
  };

  // Clear form
  const handleClearForm = () => {
    setFormData(initialFormState);
    setImages([]);
    setErrors({});
    setSubmitSuccess(false);
  };

  // Loading state
  if (lookupsLoading) {
    return (
      <div className="panel-card loading">
        <div className="spinner"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  // Error state
  if (lookupsError) {
    return (
      <div className="panel-card error">
        <p>Error loading form: {lookupsError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="panel-card">
      {/* Success Message */}
      {submitSuccess && (
        <div className="success-message">
          <span className="success-icon">🎉</span>
          <div>
            <strong>Listing created successfully!</strong>
            <p>Your gemstone is now live on the marketplace.</p>
          </div>
          <button
            className="close-success-btn"
            onClick={() => setSubmitSuccess(false)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Message from hook */}
      {submissionError && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <div>
            <strong>Error:</strong>
            <p>{submissionError}</p>
          </div>
        </div>
      )}

      <form className="sell-form" onSubmit={(e) => e.preventDefault()}>
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

        {/* Gemstone Type & Carat */}
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
              {lookups.gemstoneTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
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

        {/* Color & Color Quality */}
        <div className="form-row">
          <div className="form-field">
            <label>Color</label>
            <select
              name="colorId"
              value={formData.colorId}
              onChange={handleChange}
            >
              <option value="">Select color...</option>
              {lookups.colors.map(color => (
                <option key={color.id} value={color.id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Color Quality</label>
            <select
              name="colorQualityId"
              value={formData.colorQualityId}
              onChange={handleChange}
            >
              <option value="">Select quality...</option>
              {lookups.colorQualities.map(quality => (
                <option key={quality.id} value={quality.id}>
                  {quality.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clarity & Cut */}
        <div className="form-row">
          <div className="form-field">
            <label>Clarity</label>
            <select
              name="clarityId"
              value={formData.clarityId}
              onChange={handleChange}
            >
              <option value="">Select clarity...</option>
              {lookups.clarityGrades.map(grade => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Cut / Shape</label>
            <select
              name="cutId"
              value={formData.cutId}
              onChange={handleChange}
            >
              <option value="">Select cut...</option>
              {lookups.cuts.map(cut => (
                <option key={cut.id} value={cut.id}>
                  {cut.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Origin & Treatment */}
        <div className="form-row">
          <div className="form-field">
            <label>Origin</label>
            <select
              name="originId"
              value={formData.originId}
              onChange={handleChange}
            >
              <option value="">Select origin...</option>
              {lookups.origins.map(origin => (
                <option key={origin.id} value={origin.id}>
                  {origin.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Treatment</label>
            <select
              name="treatmentId"
              value={formData.treatmentId}
              onChange={handleChange}
            >
              <option value="">Select treatment...</option>
              {lookups.treatments.map(treatment => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dimensions */}
        <div className="form-section">
          <h4>Dimensions (mm) <span className="optional">Optional</span></h4>
          <div className="dimension-row-centered">
            <div className="form-field">
              <label>Length</label>
              <input
                type="number"
                name="lengthMm"
                value={formData.lengthMm}
                onChange={handleChange}
                placeholder="mm"
                step="0.01"
                min="0.1"
              />
            </div>
            <div className="form-field">
              <label>Width</label>
              <input
                type="number"
                name="widthMm"
                value={formData.widthMm}
                onChange={handleChange}
                placeholder="mm"
                step="0.01"
                min="0.1"
              />
            </div>
            <div className="form-field">
              <label>Depth</label>
              <input
                type="number"
                name="depthMm"
                value={formData.depthMm}
                onChange={handleChange}
                placeholder="mm"
                step="0.01"
                min="0.1"
              />
            </div>
          </div>
        </div>

        {/* Price */}
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
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="LKR">LKR (Sri Lankan Rupee)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
            </select>
          </div>
        </div>

        {/* Certificate */}
        <div className="form-section">
          <div className="checkbox-field">
            <input
              type="checkbox"
              id="isCertified"
              name="isCertified"
              checked={formData.isCertified}
              onChange={handleChange}
            />
            <label htmlFor="isCertified">This gemstone is certified</label>
          </div>

          {formData.isCertified && (
            <div className="form-field" style={{ marginTop: '0.75rem' }}>
              <label>Certificate Details</label>
              <input
                name="certificateInfo"
                value={formData.certificateInfo}
                onChange={handleChange}
                placeholder="e.g. GIA #12345678, GRS Certificate"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-field full-width">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the gemstone, its unique characteristics, history, and any other important details..."
          />
        </div>

        {/* Images */}
        <div className="form-field full-width">
          <label>Photos <span className="required">*</span></label>
          <ImageUploader images={images} setImages={setImages} maxImages={10} />
          {errors.images && <span className="error-text">{errors.images}</span>}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={handleClearForm}
          >
            Clear Form
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handlePreview}
            disabled={isSubmitting}
          >
            Preview Listing
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <ListingPreviewModal
          formData={formData}
          images={images}
          lookups={lookups}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default SellFormSection;
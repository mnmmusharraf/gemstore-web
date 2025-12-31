import React, { useState } from 'react';
import '../../styles/ListingPreviewModal.css';

function ListingPreviewModal({ 
  formData, 
  images, 
  lookups, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  // 1. Initialize state with the primary image or the first one in the array
  const [activeImage, setActiveImage] = useState(
    images.find(img => img.isPrimary) || images[0]
  );

  // Helper to get lookup name by ID (using String comparison for safety)
  const getLookupName = (list, id) => {
    if (!id) return '-';
    const item = list.find(l => String(l.id) === String(id));
    return item?.name || '-';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Preview Your Listing</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <div className="preview-layout">
            {/* Images Section */}
            <div className="preview-images">
              {/* 2. Main display area uses the activeImage from state */}
              {activeImage && (
                <div className="main-preview-container">
                  <img
                    src={activeImage.preview}
                    alt="Current Selection"
                    className="primary-preview"
                  />
                </div>
              )}
              
              {/* 3. Thumbnails loop */}
              <div className="thumbnail-row">
                {images.map((img, index) => (
                  <img
                    key={img.id || index}
                    src={img.preview}
                    alt={`Thumbnail ${index + 1}`}
                    /* 4. Update the state when a thumbnail is clicked */
                    onClick={() => setActiveImage(img)}
                    /* 5. Add 'active' class if this image matches the state */
                    className={`thumbnail ${activeImage?.id === img.id ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="preview-details">
              <h3>{formData.title || 'Untitled Listing'}</h3>

              <div className="price-display">
                <span className="price">
                  {formData.currency} {parseFloat(formData.price || 0).toLocaleString()}
                </span>
                {formData.caratWeight && formData.price > 0 && (
                  <span className="price-per-carat">
                    ({formData.currency} {(formData.price / formData.caratWeight).toLocaleString()} /ct)
                  </span>
                )}
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <span className="label">Type</span>
                  <span className="value">{getLookupName(lookups.gemstoneTypes, formData.gemstoneTypeId)}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Carat</span>
                  <span className="value">{formData.caratWeight || '-'} ct</span>
                </div>
                <div className="spec-item">
                  <span className="label">Color</span>
                  <span className="value">{getLookupName(lookups.colors, formData.colorId)}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Clarity</span>
                  <span className="value">{getLookupName(lookups.clarityGrades, formData.clarityId)}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Cut</span>
                  <span className="value">{getLookupName(lookups.cuts, formData.cutId)}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Origin</span>
                  <span className="value">{getLookupName(lookups.origins, formData.originId)}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Treatment</span>
                  <span className="value">{getLookupName(lookups.treatments, formData.treatmentId)}</span>
                </div>
                {formData.isCertified && (
                  <div className="spec-item">
                    <span className="label">Certificate</span>
                    <span className="value">{formData.certificateInfo || 'Yes'}</span>
                  </div>
                )}
              </div>

              {/* Dimensions */}
              {(formData.lengthMm || formData.widthMm || formData.depthMm) && (
                <div className="dimensions-info">
                  <span className="label">Dimensions: </span>
                  <span className="value">
                    {formData.lengthMm || '-'} × {formData.widthMm || '-'} × {formData.depthMm || '-'} mm
                  </span>
                </div>
              )}

              {/* Description */}
              {formData.description && (
                <div className="description">
                  <h4>Description</h4>
                  <p>{formData.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose} type="button">
            Edit Listing
          </button>
          <button
            className="primary-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span className="spinner-small"></span>
                Publishing...
              </>
            ) : (
              'Publish Listing'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingPreviewModal;
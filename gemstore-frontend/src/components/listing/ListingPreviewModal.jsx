// components/listing/ListingPreviewModal.jsx
import React from 'react';

function ListingPreviewModal({ 
  formData, 
  images, 
  lookups, 
  onClose, 
  onSubmit, 
  isSubmitting 
}) {
  // Helper to get lookup name by ID
  const getLookupName = (list, id) => {
    if (! id) return '-';
    const item = list.find(l => l.id === parseInt(id));
    return item?.name || '-';
  };

  const primaryImage = images.find(img => img.isPrimary) || images[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Preview Your Listing</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="preview-layout">
            {/* Images */}
            <div className="preview-images">
              {primaryImage && (
                <img
                  src={primaryImage.preview}
                  alt="Primary"
                  className="primary-preview"
                />
              )}
              <div className="thumbnail-row">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img.preview}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${img.isPrimary ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="preview-details">
              <h3>{formData.title || 'Untitled Listing'}</h3>

              <div className="price-display">
                <span className="price">
                  {formData.currency} {parseFloat(formData.price || 0).toLocaleString()}
                </span>
                {formData.caratWeight && (
                  <span className="price-per-carat">
                    ({formData.currency} {(formData.price / formData.caratWeight).toLocaleString()} /ct)
                  </span>
                )}
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <span className="label">Type</span>
                  <span className="value">
                    {getLookupName(lookups. gemstoneTypes, formData. gemstoneTypeId)}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="label">Carat</span>
                  <span className="value">{formData.caratWeight || '-'} ct</span>
                </div>
                <div className="spec-item">
                  <span className="label">Color</span>
                  <span className="value">
                    {getLookupName(lookups.colors, formData.colorId)}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="label">Clarity</span>
                  <span className="value">
                    {getLookupName(lookups.clarityGrades, formData.clarityId)}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="label">Cut</span>
                  <span className="value">
                    {getLookupName(lookups.cuts, formData.cutId)}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="label">Origin</span>
                  <span className="value">
                    {getLookupName(lookups.origins, formData. originId)}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="label">Treatment</span>
                  <span className="value">
                    {getLookupName(lookups.treatments, formData.treatmentId)}
                  </span>
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
                <div className="dimensions">
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
                  <p>{formData. description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose}>
            Edit Listing
          </button>
          <button
            className="primary-btn"
            onClick={onSubmit}
            disabled={isSubmitting}
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
import React, { useRef } from 'react';
import '../../styles/ImageUploader.css';

const ImageUploader = ({ images, setImages, maxImages = 10 }) => {
  const fileInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = maxImages - images.length;

    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    const newImages = [];
    const errors = [];

    files.forEach((file, index) => {
      const validation = validateFile(file);
      
      if (validation.valid) {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const newImage = {
            id: Date.now() + index,
            file: file,
            preview: reader.result,
            isPrimary: images.length === 0 && index === 0
          };
          
          newImages.push(newImage);
          
          // Update state after all files are processed
          if (newImages.length === files.length - errors.length) {
            setImages(prev => [...prev, ...newImages]);
          }
        };
        
        reader.readAsDataURL(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert('Some files were skipped:\n' + errors.join('\n'));
    }

    // Reset input
    e.target.value = '';
  };

  // Remove image
  const handleRemoveImage = (id) => {
    const removedImage = images.find(img => img.id === id);
    const newImages = images.filter(img => img.id !== id);

    // If removed image was primary, make first image primary
    if (removedImage?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    setImages(newImages);
  };

  // Set primary image
  const handleSetPrimary = (id) => {
    setImages(images.map(img => ({
      ...img,
      isPrimary: img.id === id
    })));
  };

  // Move image
  const handleMoveImage = (index, direction) => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const swapIndex = direction === 'left' ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];
    
    setImages(newImages);
  };

  return (
    <div className="image-uploader">
      {/* Upload button */}
      <div className="upload-zone">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button
          type="button"
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
        >
          {images.length >= maxImages ? (
            <>🚫 Maximum images reached</>
          ) : (
            <>📷 Add Photos ({images.length}/{maxImages})</>
          )}
        </button>
        
        <p className="upload-hint">
          JPEG, PNG, or WebP • Max 5MB per image
        </p>
      </div>

      {/* Image previews */}
      {images.length > 0 && (
        <div className="image-grid">
          {images.map((img, index) => (
            <div key={img.id} className="image-item">
              <img src={img.preview} alt={`Preview ${index + 1}`} />
              
              {/* Primary badge */}
              {img.isPrimary && (
                <span className="primary-badge">Primary</span>
              )}

              {/* Controls overlay */}
              <div className="image-controls">
                <button
                  type="button"
                  className="control-btn move-btn"
                  onClick={() => handleMoveImage(index, 'left')}
                  disabled={index === 0}
                  title="Move left"
                >
                  ←
                </button>

                {!img.isPrimary && (
                  <button
                    type="button"
                    className="control-btn primary-btn"
                    onClick={() => handleSetPrimary(img.id)}
                    title="Set as primary"
                  >
                    ⭐
                  </button>
                )}

                <button
                  type="button"
                  className="control-btn move-btn"
                  onClick={() => handleMoveImage(index, 'right')}
                  disabled={index === images.length - 1}
                  title="Move right"
                >
                  →
                </button>

                <button
                  type="button"
                  className="control-btn remove-btn"
                  onClick={() => handleRemoveImage(img.id)}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 
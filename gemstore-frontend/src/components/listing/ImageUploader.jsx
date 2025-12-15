// components/listing/ImageUploader.jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function ImageUploader({ images, setImages, maxImages = 10 }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = acceptedFiles.map(file => ({
      file,
      preview:  URL.createObjectURL(file),
      isPrimary: images.length === 0 // First image is primary
    }));

    setImages(prev => [...prev, ... newImages]);
  }, [images, maxImages, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '. webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If removed primary, make first image primary
      if (prev[index]?.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const setPrimaryImage = (index) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  };

  return (
    <div className="image-uploader">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`upload-box ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <span>Drop images here... </span>
        ) : (
          <span>
            <i className="upload-icon">📷</i>
            Drag & drop images here or click to browse
            <small>Max {maxImages} images, 5MB each</small>
          </span>
        )}
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="image-previews">
          {images.map((img, index) => (
            <div
              key={index}
              className={`preview-item ${img.isPrimary ? 'primary' : ''}`}
            >
              <img src={img.preview} alt={`Preview ${index + 1}`} />
              <div className="preview-actions">
                <button
                  type="button"
                  className="set-primary-btn"
                  onClick={() => setPrimaryImage(index)}
                  title="Set as primary"
                >
                  {img.isPrimary ? '⭐' : '☆'}
                </button>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeImage(index)}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
              {img.isPrimary && <span className="primary-badge">Primary</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
import React, { useState } from 'react';
import './ImageCarousel.css';

// Placeholder image when no images available
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400? text=No+Image';

function ImageCarousel({ images, alt }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [imageError, setImageError] = useState({});

  // Extract image URLs - handle different data structures
  const getImageUrls = () => {
    if (!images || images.length === 0) {
      return [PLACEHOLDER_IMAGE];
    }

    return images.map((img) => {
      // Handle different possible structures
      if (typeof img === 'string') {
        return img;
      }
      if (img?. imageUrl) {
        return img. imageUrl;
      }
      if (img?.url) {
        return img.url;
      }
      return PLACEHOLDER_IMAGE;
    });
  };

  const imageUrls = getImageUrls();

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? imageUrls. length - 1 : prev - 1));
  };

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (! touchStart) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    setTouchStart(null);
  };

  // Handle image load error
  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div 
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main Image */}
      <div 
        className="carousel-track" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageUrls.map((url, index) => (
          <div key={index} className="carousel-slide">
            <img 
              src={imageError[index] ?  PLACEHOLDER_IMAGE : url} 
              alt={`${alt} - ${index + 1}`}
              loading={index === 0 ?  'eager' : 'lazy'}
              onError={() => handleImageError(index)}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {imageUrls.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={goToPrevious}>
            ‹
          </button>
          <button className="carousel-btn next" onClick={goToNext}>
            ›
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {imageUrls.length > 1 && (
        <div className="carousel-dots">
          {imageUrls.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => {
                e. stopPropagation();
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageCarousel;
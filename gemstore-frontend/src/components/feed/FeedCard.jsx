import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import ImageCarousel from './ImageCarousel';
import './FeedCard.css';

const FeedCard = memo(function FeedCard({ 
  listing, 
  onLike, 
  onSave, 
  onReport, 
  onInquire,
  isAuthenticated, 
  onSellerClick 
}) {
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [localLiked, setLocalLiked] = useState(listing.isLiked || false);
  const [localLikesCount, setLocalLikesCount] = useState(listing.likesCount || 0);
  const [localSaved, setLocalSaved] = useState(listing.isFavorited || false);

  const {
    id,
    title,
    price,
    currency = 'LKR',
    caratWeight,
    imageUrls = [],
    primaryImageUrl,
    imageUrl,
    sellerId,
    sellerName,
    sellerAvatar,
    gemstoneType,
    color,
    colorQuality,
    clarity,
    cut,
    origin,
    treatment,
    lengthMm,
    widthMm,
    depthMm,
    createdAt,
    isSold,
    pricePerCarat,
    isCertified,
  } = listing;

  const getImages = () => {
    if (imageUrls && imageUrls.length > 0) {
      return imageUrls.map((url) => ({ imageUrl: url }));
    }
    if (primaryImageUrl) return [{ imageUrl: primaryImageUrl }];
    if (imageUrl) return [{ imageUrl }];
    return [];
  };

  const images = getImages();

  const getDimensions = () => {
    const dims = [lengthMm, widthMm, depthMm].filter((d) => d != null);
    if (dims.length === 0) return null;
    return dims.map((d) => `${d}`).join(' × ') + ' mm';
  };

  const dimensions = getDimensions();

  const formatPrice = (amount, curr) => {
    if (!amount) return null;
    if (curr === 'LKR') {
      return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formattedPrice = formatPrice(price, currency);

  const timeAgo = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : '';

  const hasMoreDetails = colorQuality || clarity || cut || treatment || dimensions || pricePerCarat;

  // ===== HANDLERS =====

  const handleLike = async (e) => {
    e?.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to like listings');
      navigate('/login');
      return;
    }

    if (isLiking) return;

    const wasLiked = localLiked;
    setLocalLiked(!wasLiked);
    setLocalLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      await onLike(id);
    } catch (error) {
      console.error('Like toggle failed:', error);
      setLocalLiked(wasLiked);
      setLocalLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async (e) => {
    e?.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to save listings');
      navigate('/login');
      return;
    }

    if (isSaving) return;

    const wasSaved = localSaved;
    setLocalSaved(!wasSaved);
    setIsSaving(true);

    try {
      await onSave(id);
      toast.success(wasSaved ? 'Removed from saved' : 'Added to saved');
    } catch (error) {
      console.error('Save toggle failed:', error);
      setLocalSaved(wasSaved);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReport = (e) => {
    e?.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to report listings');
      navigate('/login');
      return;
    }

    if (typeof onReport === 'function') {
      onReport(id, listing);
    } else {
      toast('Report this listing?', {
        action: {
          label: 'Report',
          onClick: () => toast.success('Report submitted. We will review this listing.'),
        },
      });
    }
  };

  // ✅ INQUIRE - Opens conversation with seller
  const handleInquire = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to send inquiries');
      navigate('/login');
      return;
    }

    // ✅ Get the first image URL properly
    const firstImageUrl = images[0]?.imageUrl || primaryImageUrl || imageUrl || null;
    
    console.log('📷 FeedCard sending inquiry with imageUrl:', firstImageUrl);

    if (typeof onInquire === 'function') {
      onInquire({
        sellerId,
        sellerName,
        sellerAvatar,
        listing: {
          id,
          title,
          price,
          currency,
          formattedPrice,
          imageUrl: firstImageUrl,
          gemstoneType,
        }
      });
    }
  };

  const handleDoubleClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like listings');
      navigate('/login');
      return;
    }

    if (!localLiked) {
      setShowHeart(true);
      setLocalLiked(true);
      setLocalLikesCount((prev) => prev + 1);

      try {
        await onLike(id);
      } catch (error) {
        console.error('Failed to like on double tap:', error);
        setLocalLiked(false);
        setLocalLikesCount((prev) => prev - 1);
      }

      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  const handleSellerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!sellerId) {
      console.warn('⚠️ sellerId is undefined!');
      return;
    }

    if (typeof onSellerClick === 'function') {
      onSellerClick(sellerId);
    } else {
      navigate(`/user/${sellerId}`);
    }
  };

  const handleCardClick = () => navigate(`/listing/${id}`);

  const handleShare = async (e) => {
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/listing/${id}`;
    const shareData = {
      title: title,
      text: `Check out this ${gemstoneType}: ${title} - ${formattedPrice}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    }
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  // ===== RENDER =====

  return (
    <article className="feed-card">
      {/* ===== HEADER ===== */}
      <header className="feed-header" onClick={handleSellerClick}>
        <div className="seller-avatar">
          {sellerAvatar ? (
            <img src={sellerAvatar} alt={sellerName} />
          ) : (
            <span>{sellerName?.charAt(0)?.toUpperCase() || 'G'}</span>
          )}
        </div>
        <div className="seller-info">
          <span className="seller-name">{sellerName || 'Unknown Seller'}</span>
          <span className="post-time">{timeAgo}</span>
        </div>
        <button 
          className="header-more-btn" 
          onClick={(e) => { e.stopPropagation(); handleReport(e); }} 
          title="More options"
        >
          <MoreIcon size={20} />
        </button>
      </header>

      {/* ===== IMAGE ===== */}
      <div className="feed-image" onDoubleClick={handleDoubleClick}>
        <ImageCarousel images={images} alt={title} />

        {showHeart && (
          <div className="double-tap-heart">
            <HeartFilledIcon size={80} />
          </div>
        )}

        {isSold && (
          <div className="sold-overlay">
            <span>SOLD</span>
          </div>
        )}

        {images.length > 1 && (
          <span className="image-count">
            <ImageIcon size={14} />
            {images.length}
          </span>
        )}
      </div>

      {/* ===== GEM INFO (COMPACT) ===== */}
      <div className="gem-info" onClick={handleCardClick}>
        <div className="info-header">
          <span className="gem-type">{gemstoneType || 'Gemstone'}</span>
          <span className="gem-price">{formattedPrice}</span>
        </div>

        <h3 className="gem-title">{title}</h3>

        {/* Compact Specs */}
        <div className="gem-specs-compact">
          {caratWeight && (
            <span className="compact-spec">
              <strong>{caratWeight}</strong> ct
            </span>
          )}
          {color && (
            <span className="compact-spec">
              {color}
            </span>
          )}
          {origin && (
            <span className="compact-spec">
              <LocationIcon size={12} />
              {origin}
            </span>
          )}
          {isCertified && (
            <span className="compact-spec certified">
              <CertifiedIcon size={12} />
              Certified
            </span>
          )}
        </div>

        {/* Expandable Details */}
        {hasMoreDetails && (
          <>
            <button className="show-details-btn" onClick={toggleDetails}>
              {showDetails ? (
                <>
                  <ChevronUpIcon size={16} />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDownIcon size={16} />
                  More Details
                </>
              )}
            </button>

            {showDetails && (
              <div className="gem-specs-expanded">
                {colorQuality && (
                  <div className="spec-row">
                    <span className="spec-label">Color Quality</span>
                    <span className="spec-value">{colorQuality}</span>
                  </div>
                )}
                {clarity && (
                  <div className="spec-row">
                    <span className="spec-label">Clarity</span>
                    <span className="spec-value">{clarity}</span>
                  </div>
                )}
                {cut && (
                  <div className="spec-row">
                    <span className="spec-label">Cut</span>
                    <span className="spec-value">{cut}</span>
                  </div>
                )}
                {treatment && (
                  <div className="spec-row">
                    <span className="spec-label">Treatment</span>
                    <span className="spec-value">{treatment}</span>
                  </div>
                )}
                {dimensions && (
                  <div className="spec-row">
                    <span className="spec-label">Dimensions</span>
                    <span className="spec-value">{dimensions}</span>
                  </div>
                )}
                {pricePerCarat && (
                  <div className="spec-row">
                    <span className="spec-label">Price/ct</span>
                    <span className="spec-value">{formatPrice(pricePerCarat, currency)}</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== ACTIONS ===== */}
      <div className="feed-actions">
        <button
          className={`action-btn ${localLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          {localLiked ? <HeartFilledIcon size={22} /> : <HeartOutlineIcon size={22} />}
          <span>{localLikesCount > 0 ? localLikesCount : 'Like'}</span>
        </button>

        <button className="action-btn" onClick={handleInquire}>
          <CommentIcon size={22} />
          <span>Inquire</span>
        </button>

        <button className="action-btn" onClick={handleShare}>
          <ShareIcon size={22} />
          <span>Share</span>
        </button>

        <button
          className={`action-btn ${localSaved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {localSaved ? <BookmarkFilledIcon size={22} /> : <BookmarkIcon size={22} />}
          <span>{localSaved ? 'Saved' : 'Save'}</span>
        </button>

        <button className="action-btn report-btn" onClick={handleReport}>
          <ReportIcon size={22} />
          <span>Report</span>
        </button>
      </div>
    </article>
  );
});

/* ===== ICONS ===== */

const HeartOutlineIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartFilledIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const BookmarkIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const BookmarkFilledIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ImageIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CertifiedIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const LocationIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ReportIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const MoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const ChevronDownIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export default FeedCard;
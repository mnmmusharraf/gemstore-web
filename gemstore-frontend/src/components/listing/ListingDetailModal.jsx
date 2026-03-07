import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL, getAuthHeaders, handleResponse } from '../../api/config';
import LoadingSpinner from '../common/LoadingSpinner';
import ReportModal from '../report/ReportModal';
import './ListingDetailModal.css';

const ListingDetailModal = ({ 
  listingId, 
  isOpen, 
  onClose, 
  currentUser,
  onEdit,
  onDelete,
  onLike,
  onSave,
  onShareToChat,
  onInquire,
}) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Helper: Extract display value from field (handles objects with name property)
  const getValue = (field) => {
    if (field === null || field === undefined) return null;
    if (typeof field === 'object') {
      return field.name || field.label || field.value || null;
    }
    return field;
  };

  // Fetch listing details
  useEffect(() => {
    if (isOpen && listingId) {
      fetchListing();
      setCurrentImageIndex(0);
      setShowOptions(false);
      setShowReportModal(false);
      setShowShareMenu(false);
    }
  }, [isOpen, listingId]);

  const fetchListing = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/listings/${listingId}`,
        { headers: getAuthHeaders() }
      );
      const data = await handleResponse(response);
      
      const listingData = data.data || data;
      setListing(listingData);
      setIsLiked(listingData.isLiked || false);
      setIsSaved(listingData.isFavorited || false);
      setLikesCount(listingData.likesCount || 0);
      
      const sellerId = listingData.sellerId || listingData.seller?.id || listingData.userId;
      const userId = currentUser?.id;
      
      const ownershipCheck = sellerId && userId && String(sellerId) === String(userId);
      setIsOwner(ownershipCheck);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      toast.error('Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showReportModal) {
          setShowReportModal(false);
        } else if (showShareMenu) {
          setShowShareMenu(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, showReportModal, showShareMenu]);

  if (!isOpen) return null;

  // Get images
  const getImages = () => {
    if (!listing) return [];
    if (listing.imageUrls && listing.imageUrls.length > 0) return listing.imageUrls;
    if (listing.images && listing.images.length > 0) {
      return listing.images.map(img => typeof img === 'string' ? img : (img.imageUrl || img.url));
    }
    if (listing.primaryImageUrl) return [listing.primaryImageUrl];
    return [];
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Format helpers
  const formatPrice = (amount, currency = 'LKR') => {
    if (!amount) return null;
    if (currency === 'LKR') {
      return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDimensions = () => {
    if (!listing) return null;
    const dims = [listing.lengthMm, listing.widthMm, listing.depthMm].filter(Boolean);
    if (dims.length === 0) return null;
    return dims.join(' × ') + ' mm';
  };

  const formattedPrice = formatPrice(listing?.price, listing?.currency);

  // ===== ACTION HANDLERS =====

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like listings');
      return;
    }
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (onLike) await onLike(listingId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setIsLiked(wasLiked);
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      toast.error('Please login to save listings');
      return;
    }
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);

    try {
      if (onSave) await onSave(listingId);
      toast.success(wasSaved ? 'Removed from saved' : 'Added to saved');
    } catch (error) {
      console.error('Failed to toggle save:', error);
      setIsSaved(wasSaved);
    }
  };

  const handleEdit = () => {
    setShowOptions(false);
    if (onEdit) onEdit(listing);
  };

  const handleDelete = () => {
    setShowOptions(false);
    if (onDelete) {
      toast('Delete this listing?', {
        action: {
          label: 'Delete',
          onClick: async () => {
            try {
              await onDelete(listingId);
              onClose();
            } catch (error) {
              console.error('Delete failed:', error);
            }
          },
        },
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/listing/${listingId}`);
    toast.success('Link copied!');
    setShowOptions(false);
  };

  const handleReport = () => {
    setShowOptions(false);
    if (!currentUser) {
      toast.error('Please login to report listings');
      return;
    }
    setShowReportModal(true);
  };

  // ===== SHARE HANDLERS =====

  const handleShareClick = () => {
    setShowShareMenu(!showShareMenu);
  };

  const handleShareExternal = async () => {
    setShowShareMenu(false);

    const shareUrl = `${window.location.origin}/listing/${listingId}`;
    const gemstoneType = getValue(listing?.gemstoneType);
    const shareData = {
      title: listing?.title,
      text: `Check out this ${gemstoneType || 'gemstone'}: ${listing?.title} - ${formattedPrice}`,
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

  const handleShareToChat = () => {
    setShowShareMenu(false);

    if (!currentUser) {
      toast.error('Please login to share listings');
      return;
    }

    const gemstoneType = getValue(listing?.gemstoneType);
    const firstImageUrl = images[0] || listing?.primaryImageUrl || null;

    if (typeof onShareToChat === 'function') {
      onShareToChat({
        listing: {
          id: listingId,
          title: listing?.title,
          price: listing?.price,
          currency: listing?.currency,
          formattedPrice,
          imageUrl: firstImageUrl,
          gemstoneType,
        }
      });
    } else {
      toast.info('Share to chat coming soon!');
    }
  };

  // ===== INQUIRE HANDLER =====

  const handleInquire = () => {
    if (!currentUser) {
      toast.error('Please login to send inquiries');
      return;
    }

    const sellerId = listing?.sellerId || listing?.seller?.id;
    const sellerName = listing?.sellerName || listing?.seller?.username || listing?.seller?.displayName;
    const sellerAvatar = listing?.sellerAvatar || listing?.seller?.avatarUrl;
    const gemstoneType = getValue(listing?.gemstoneType);
    const firstImageUrl = images[0] || listing?.primaryImageUrl || null;

    if (typeof onInquire === 'function') {
      onInquire({
        sellerId,
        sellerName,
        sellerAvatar,
        listing: {
          id: listingId,
          title: listing?.title,
          price: listing?.price,
          currency: listing?.currency,
          formattedPrice,
          imageUrl: firstImageUrl,
          gemstoneType,
        }
      });
    }
  };

  // Extract display values
  const gemstoneType = getValue(listing?.gemstoneType);
  const color = getValue(listing?.color);
  const colorQuality = getValue(listing?.colorQuality);
  const clarity = getValue(listing?.clarity);
  const cut = getValue(listing?.cut);
  const origin = getValue(listing?.origin);
  const treatment = getValue(listing?.treatment);
  const dimensions = getDimensions();
  const sellerName = listing?.sellerName || listing?.seller?.username || listing?.seller?.displayName || 'Seller';
  const sellerAvatar = listing?.sellerAvatar || listing?.seller?.avatarUrl;

  // Build specs array
  const specs = [
    { label: 'Carat Weight', value: listing?.caratWeight ? `${listing.caratWeight} ct` : null },
    { label: 'Color', value: color },
    { label: 'Color Quality', value: colorQuality },
    { label: 'Clarity', value: clarity },
    { label: 'Cut/Shape', value: cut },
    { label: 'Origin', value: origin },
    { label: 'Treatment', value: treatment },
    { label: 'Dimensions', value: dimensions },
    { label: 'Price/Carat', value: listing?.pricePerCarat ? formatPrice(listing.pricePerCarat, listing.currency) : null },
  ].filter(spec => spec.value);

  return (
    <div className="listing-modal-overlay" onClick={onClose}>
      {/* Close Button */}
      <button className="listing-modal-close" onClick={onClose} aria-label="Close">
        <CloseIcon size={28} />
      </button>

      <div className="listing-modal" onClick={(e) => {
        e.stopPropagation();
        // Close share menu when clicking anywhere inside modal but outside menu
        if (showShareMenu) setShowShareMenu(false);
      }}>
        {loading ? (
          <div className="listing-modal-loading">
            <LoadingSpinner message="Loading..." />
          </div>
        ) : listing ? (
          <div className="listing-modal-content">
            {/* Left: Image Gallery */}
            <div className="listing-modal-gallery">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    className="listing-modal-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                    }}
                  />
                  {hasMultipleImages && (
                    <>
                      <button className="gallery-nav prev" onClick={prevImage}>
                        <ChevronLeftIcon size={20} />
                      </button>
                      <button className="gallery-nav next" onClick={nextImage}>
                        <ChevronRightIcon size={20} />
                      </button>
                      <div className="gallery-dots">
                        {images.map((_, idx) => (
                          <span
                            key={idx}
                            className={`gallery-dot ${idx === currentImageIndex ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImageIndex(idx);
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="listing-modal-placeholder">💎</div>
              )}

              {(listing.status === 'SOLD' || listing.isSold) && (
                <div className="listing-modal-badge sold">SOLD</div>
              )}
            </div>

            {/* Right: Details */}
            <div className="listing-modal-details">
              {/* Header with Seller & Options */}
              <div className="listing-modal-header">
                <div className="listing-modal-seller">
                  <div className="seller-avatar">
                    {sellerAvatar ? (
                      <img src={sellerAvatar} alt={sellerName} />
                    ) : (
                      <span>{sellerName?.[0]?.toUpperCase() || 'G'}</span>
                    )}
                  </div>
                  <span className="seller-name">{sellerName}</span>
                  {isOwner && <span className="owner-badge">You</span>}
                </div>

                <div className="listing-modal-options-wrapper">
                  <button
                    className="listing-modal-options-btn"
                    onClick={() => setShowOptions(!showOptions)}
                    aria-label="Options"
                  >
                    <MoreIcon size={24} />
                  </button>
                  
                  {showOptions && (
                    <>
                      <div className="options-backdrop" onClick={() => setShowOptions(false)} />
                      <div className="listing-modal-options-menu">
                        {isOwner ? (
                          <>
                            <button onClick={handleEdit}>
                              <EditIcon size={20} />
                              <span>Edit Listing</span>
                            </button>
                            <button className="danger" onClick={handleDelete}>
                              <DeleteIcon size={20} />
                              <span>Delete Listing</span>
                            </button>
                            <button onClick={handleCopyLink}>
                              <LinkIcon size={20} />
                              <span>Copy Link</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={handleCopyLink}>
                              <LinkIcon size={20} />
                              <span>Copy Link</span>
                            </button>
                            <button className="danger" onClick={handleReport}>
                              <ReportIcon size={20} />
                              <span>Report Listing</span>
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="listing-modal-body">
                <h2 className="listing-modal-title">{listing.title}</h2>
                
                <div className="listing-modal-price">
                  {formattedPrice}
                </div>

                <div className="listing-modal-type">
                  <span className="type-name">{gemstoneType || 'Gemstone'}</span>
                  {listing.isCertified && (
                    <span className="certified-badge">
                      <CertifiedIcon size={14} /> Certified
                    </span>
                  )}
                </div>

                {specs.length > 0 && (
                  <div className="listing-modal-specs">
                    {specs.map((spec, index) => (
                      <div className="spec-item" key={index}>
                        <span className="spec-label">{spec.label}</span>
                        <span className="spec-value">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {listing.description && (
                  <div className="listing-modal-section">
                    <h4>Description</h4>
                    <p>{listing.description}</p>
                  </div>
                )}

                {listing.certificateInfo && (
                  <div className="listing-modal-section">
                    <h4>Certificate</h4>
                    <p>{listing.certificateInfo}</p>
                  </div>
                )}

                {listing.createdAt && (
                  <div className="listing-modal-date">
                    Posted on {formatDate(listing.createdAt)}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="listing-modal-actions">
                <div className="actions-row">
                  {/* Like */}
                  <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                    title="Like"
                  >
                    {isLiked ? <HeartFilledIcon size={28} /> : <HeartOutlineIcon size={28} />}
                  </button>

                  {/* Inquire — only for non-owners */}
                  {!isOwner && onInquire && (
                    <button
                      className="action-btn"
                      onClick={handleInquire}
                      title="Inquire"
                    >
                      <CommentIcon size={28} />
                    </button>
                  )}

                  {/* Share with dropdown */}
                  <div className="share-btn-wrapper" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="action-btn"
                      onClick={handleShareClick}
                      title="Share"
                    >
                      <ShareIcon size={28} />
                    </button>

                    {showShareMenu && (
                      <div className="share-menu">
                        <button className="share-menu-item" onClick={handleShareToChat}>
                          <MessageIcon size={18} />
                          <span>Send to Chat</span>
                        </button>
                        <button className="share-menu-item" onClick={handleShareExternal}>
                          <LinkIcon size={18} />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Save */}
                  <button 
                    className={`action-btn ${isSaved ? 'saved' : ''}`} 
                    onClick={handleSave}
                    title="Save"
                  >
                    {isSaved ? <BookmarkFilledIcon size={28} /> : <BookmarkIcon size={28} />}
                  </button>
                </div>
                
                {likesCount > 0 && (
                  <div className="likes-count">
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="listing-modal-error">
            <p>Failed to load listing</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType="LISTING"
          targetId={listingId}
          targetTitle={listing?.title || 'Listing'}
        />
      )}
    </div>
  );
};

/* ===== ICONS ===== */
const CloseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MoreIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

const EditIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const LinkIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ReportIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

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

const ShareIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CommentIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const MessageIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const CertifiedIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default ListingDetailModal;
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import './MessagesSection.css';

function MessageBubble({ message, showAvatar, isLast, currentUserId }) {
  const isOwn = 
    message.isOwnMessage === true || 
    message.isOwnMessage === 'true' ||
    Number(message.senderId) === Number(currentUserId);

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SENDING':
        return <span className="status-icon sending">○</span>;
      case 'SENT':
        return <span className="status-icon sent">✓</span>;
      case 'DELIVERED':
        return <span className="status-icon delivered">✓✓</span>;
      case 'READ':
        return <span className="status-icon read">✓✓</span>;
      case 'FAILED':
        return <span className="status-icon failed">!</span>;
      default:
        return null;
    }
  };

  // ✅ Parse listing data from message content
  const { listingData, textContent } = useMemo(() => {
    const content = message.content || '';
    
    // Check for embedded listing format: [LISTING:{json}]text
    const listingMatch = content.match(/^\[LISTING:(.*?)\](.*)$/s);
    
    if (listingMatch) {
      try {
        const listing = JSON.parse(listingMatch[1]);
        const text = listingMatch[2].trim();
        return { listingData: listing, textContent: text };
      } catch (e) {
        console.error('Failed to parse listing data:', e);
        return { listingData: null, textContent: content };
      }
    }
    
    // Check if message has listingPreview from props (for real-time messages)
    if (message.listingPreview) {
      return { listingData: message.listingPreview, textContent: content };
    }
    
    return { listingData: null, textContent: content };
  }, [message.content, message.listingPreview]);

  const hasListing = !!listingData;

  return (
    <div className={`message-wrapper ${isOwn ? 'own' : 'other'} ${isLast ? 'last' : ''}`}>
      {/* Show avatar for other user's messages */}
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {message.senderAvatarUrl ? (
            <img src={message.senderAvatarUrl} alt={message.senderDisplayName} />
          ) : (
            <span>
              {message.senderDisplayName?.charAt(0).toUpperCase() || 
               message.senderUsername?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
      )}
      
      {/* Spacer when no avatar but it's other user's message */}
      {!isOwn && !showAvatar && <div className="message-avatar-spacer" />}

      <div className={`message-bubble ${isOwn ? 'own' : 'other'} ${hasListing ? 'has-listing' : ''}`}>
        {/* ✅ Rich Listing Card Preview */}
        {hasListing && (
          <div className="message-listing-card">
            {listingData.imageUrl && (
              <div className="message-listing-image">
                <img 
                  src={listingData.imageUrl} 
                  alt={listingData.title}
                  onError={(e) => {
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="message-listing-details">
              {listingData.gemstoneType && (
                <span className="message-listing-type">{listingData.gemstoneType}</span>
              )}
              <span className="message-listing-title">
                {listingData.title}
              </span>
              <span className="message-listing-price">
                {listingData.formattedPrice || `${listingData.currency} ${listingData.price}`}
              </span>
            </div>
          </div>
        )}

        {/* Message Content */}
        <p className="message-content">{textContent || 'Is this still available?'}</p>

        {/* Message Footer */}
        <div className="message-footer">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isOwn && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
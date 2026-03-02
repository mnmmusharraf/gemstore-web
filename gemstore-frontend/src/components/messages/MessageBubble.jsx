import React from 'react';
import { format } from 'date-fns';
import './MessagesSection.css';

function MessageBubble({ message, showAvatar, isLast, currentUserId }) {
  // ✅ FIX: Properly check if message is from current user
  // Handle both number and string comparison
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

      <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
        {/* Listing Preview (if messageType is LISTING) */}
        {message.messageType === 'LISTING' && message.listingPreview && (
          <div className="message-listing-preview">
            <img src={message.listingPreview.imageUrl} alt={message.listingPreview.title} />
            <div className="listing-info">
              <span className="listing-title">{message.listingPreview.title}</span>
              <span className="listing-price">
                {message.listingPreview.currency} {message.listingPreview.price}
              </span>
            </div>
          </div>
        )}

        {/* Message Content */}
        <p className="message-content">{message.content}</p>

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
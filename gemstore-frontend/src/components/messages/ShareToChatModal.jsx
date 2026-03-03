import React, { useState, useEffect } from 'react';
import messageService from '../../api/messageService';
import './ShareToChatModal.css';

function ShareToChatModal({ listing, onClose, onShare }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await messageService.getConversations();
        if (response.success) {
          setConversations(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => 
    conv.partnerDisplayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.partnerUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle conversation selection (multi-select)
  const toggleSelection = (conversation) => {
    setSelectedConversations(prev => {
      const isSelected = prev.some(c => c.partnerId === conversation.partnerId);
      if (isSelected) {
        return prev.filter(c => c.partnerId !== conversation.partnerId);
      } else {
        return [...prev, conversation];
      }
    });
  };

  // Check if conversation is selected
  const isSelected = (conversation) => {
    return selectedConversations.some(c => c.partnerId === conversation.partnerId);
  };

  // Handle share to multiple people
  const handleShare = async () => {
    if (selectedConversations.length === 0 || !listing) return;

    setSending(true);
    try {
      await onShare(selectedConversations, listing, customMessage);
      onClose();
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setSending(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="share-modal-header">
          <h3>Share Listing</h3>
          <button className="share-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Listing Preview */}
        <div className="share-listing-preview">
          {listing.imageUrl ? (
            <img 
              src={listing.imageUrl} 
              alt={listing.title}
              className="share-listing-image"
            />
          ) : (
            <div className="share-listing-placeholder">💎</div>
          )}
          <div className="share-listing-info">
            <span className="share-listing-type">{listing.gemstoneType}</span>
            <span className="share-listing-title">{listing.title}</span>
            <span className="share-listing-price">{listing.formattedPrice}</span>
          </div>
        </div>

        {/* Custom Message Input */}
        <div className="share-message-input">
          <input
            type="text"
            placeholder="Add a message (optional)..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>

        {/* Search */}
        <div className="share-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Selected count indicator */}
        {selectedConversations.length > 0 && (
          <div className="share-selected-count">
            {selectedConversations.length} selected
          </div>
        )}

        {/* Conversations List */}
        <div className="share-conversations">
          {loading ? (
            <div className="share-loading">
              <div className="share-loading-spinner"></div>
              <span>Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="share-empty">
              {searchQuery ? 'No conversations found' : 'No conversations yet. Start chatting to share listings!'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.partnerId}
                className={`share-conversation-item ${isSelected(conv) ? 'selected' : ''}`}
                onClick={() => toggleSelection(conv)}
              >
                <div className="share-conv-avatar">
                  {conv.partnerAvatarUrl ? (
                    <img src={conv.partnerAvatarUrl} alt={conv.partnerDisplayName} />
                  ) : (
                    <span>{conv.partnerDisplayName?.charAt(0).toUpperCase()}</span>
                  )}
                  {conv.partnerIsOnline && <span className="share-online-dot"></span>}
                </div>
                <div className="share-conv-info">
                  <span className="share-conv-name">
                    {conv.partnerDisplayName || conv.partnerUsername}
                  </span>
                </div>
                <div className={`share-checkbox ${isSelected(conv) ? 'checked' : ''}`}>
                  {isSelected(conv) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* ✅ Footer - Send/Cancel Buttons */}
        <div className="share-modal-footer">
          <button className="share-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="share-send-btn"
            onClick={handleShare}
            disabled={selectedConversations.length === 0 || sending}
          >
            {sending ? (
              <>
                <span className="share-btn-spinner"></span>
                Sending...
              </>
            ) : (
              `Send${selectedConversations.length > 0 ? ` (${selectedConversations.length})` : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareToChatModal;
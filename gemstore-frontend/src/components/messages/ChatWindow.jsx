import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { getAuthToken } from '../../api/config';
import './MessagesSection.css';

const getCurrentUserId = () => {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Number(payload.uid) || Number(payload.userId) || payload.sub;
  } catch {
    return null;
  }
};

function ChatWindow({
  conversation,
  messages,
  loading,
  sending,
  isTyping,
  isConnected,
  onSendMessage,
  onTyping,
  onBack,
  onProfileClick,
  pendingListing,
  onClearPendingListing,
  pendingMessage,
  onClearPendingMessage,
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const currentUserId = getCurrentUserId();

  // ✅ Debug: Log what ChatWindow receives
  useEffect(() => {
    console.log('🪟 ChatWindow received:', {
      conversationPartner: conversation?.partnerDisplayName,
      pendingListingTitle: pendingListing?.title,
      pendingMessageLength: pendingMessage?.length,
    });
  }, [conversation, pendingListing, pendingMessage]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversation?.partnerId, messages.length]);

  const handleSend = async (content) => {
    console.log('📤 Sending message:', { content, hasPendingListing: !!pendingListing });
    if (pendingListing) {
      await onSendMessage(content, 'LISTING', pendingListing.id);
      onClearPendingListing?.();
      onClearPendingMessage?.();
    } else {
      await onSendMessage(content);
    }
  };

  // Key for MessageInput - changes when pendingMessage changes
  const inputKey = pendingMessage 
    ? `inquiry-${conversation?.partnerId}-${pendingListing?.id || 'listing'}` 
    : `normal-${conversation?.partnerId || 'none'}`;

  console.log('🔑 MessageInput key:', inputKey);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          {onBack && (
            <button className="mobile-back-btn" onClick={onBack} title="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          )}
          
          <div className="chat-avatar">
            {conversation.partnerAvatarUrl ? (
              <img 
                src={conversation.partnerAvatarUrl} 
                alt={conversation.partnerDisplayName}
              />
            ) : (
              <span>
                {conversation.partnerDisplayName?.charAt(0).toUpperCase() || 
                 conversation.partnerUsername?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="chat-user-info">
            <h3>{conversation.partnerDisplayName || conversation.partnerUsername}</h3>
            <span className={`chat-status ${conversation.partnerIsOnline ? 'online' : ''}`}>
              {isTyping ? 'Typing...' : (conversation.partnerIsOnline ? 'Online' : 'Offline')}
            </span>
          </div>
        </div>
        <div className="chat-actions">
          <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="connection-dot"></span>
          </span>
          <button className="chat-action-btn" title="View Profile" onClick={onProfileClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M7 20.662V19a2 2 0 012-2h6a2 2 0 012 2v1.662"></path>
            </svg>
          </button>
          <button className="chat-action-btn" title="More Options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {loading ? (
          <div className="chat-loading">
            <div className="loading-spinner"></div>
            <span>Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p>No messages yet</p>
            <span>Send a message to start the conversation!</span>
          </div>
        ) : (
          <>
            <div className="messages-spacer" />
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id || index}
                message={message}
                currentUserId={currentUserId}
                showAvatar={
                  index === 0 || 
                  messages[index - 1]?.senderId !== message.senderId
                }
                isLast={
                  index === messages.length - 1 || 
                  messages[index + 1]?.senderId !== message.senderId
                }
              />
            ))}
            {isTyping && (
              <TypingIndicator 
                username={conversation.partnerDisplayName}
                avatarUrl={conversation.partnerAvatarUrl}
              />
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ✅ Listing Preview Above Input */}
      {pendingListing ? (
        <div className="listing-preview-bar">
          <div className="listing-preview-content">
            {pendingListing.imageUrl && (
              <img 
                src={pendingListing.imageUrl} 
                alt={pendingListing.title}
                className="listing-preview-image"
              />
            )}
            <div className="listing-preview-info">
              <span className="listing-preview-label">Asking about:</span>
              <span className="listing-preview-title">{pendingListing.title}</span>
              <span className="listing-preview-price">{pendingListing.formattedPrice}</span>
            </div>
          </div>
          <button 
            className="listing-preview-close"
            onClick={() => {
              onClearPendingListing?.();
              onClearPendingMessage?.();
            }}
            title="Remove"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ) : (
        <>{/* Debug: No pending listing */}</>
      )}

      {/* Message Input */}
      <MessageInput 
        key={inputKey}
        onSendMessage={handleSend}
        onTyping={onTyping}
        disabled={sending || !isConnected}
        sending={sending}
        placeholder={pendingListing ? `Ask about ${pendingListing.title}...` : 'Type a message...'}
        defaultMessage={pendingMessage || ''}
        onMessageChange={onClearPendingMessage}
      />
    </div>
  );
}

export default ChatWindow;
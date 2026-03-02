import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { getAuthToken } from '../../api/config';
import './MessagesSection.css';

// Helper to get user ID from token
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
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const currentUserId = getCurrentUserId();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Also scroll on initial load
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversation?.partnerId, messages.length]);

  const handleSend = async (content) => {
    await onSendMessage(content);
  };

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
          <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`} title={isConnected ? 'Connected' : 'Disconnected'}>
            <span className="connection-dot"></span>
          </span>
          <button 
            className="chat-action-btn" 
            title="View Profile"
            onClick={onProfileClick}
          >
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
            {/* ✅ ADD THIS SPACER - Pushes messages to bottom */}
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

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSend}
        onTyping={onTyping}
        disabled={sending || !isConnected}
        sending={sending}
      />
    </div>
  );
}

export default ChatWindow;
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import './MessagesSection.css';

function ConversationList({ 
  conversations, 
  activeConversation, 
  onSelectConversation,
  loading 
}) {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: false });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
        </div>
        <div className="messages-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="conversation-skeleton">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-name"></div>
                <div className="skeleton-preview"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="messages-sidebar">
      <div className="messages-header">
        <h2>Messages</h2>
        <span className="messages-count">{conversations.length}</span>
      </div>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet</p>
            <span>Start messaging other users!</span>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.partnerId}
              className={`conversation-item ${
                activeConversation?.partnerId === conversation.partnerId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-avatar">
                {conversation.partnerAvatarUrl ? (
                  <img 
                    src={conversation.partnerAvatarUrl} 
                    alt={conversation.partnerDisplayName}
                  />
                ) : (
                  <span>{conversation.partnerDisplayName?.charAt(0).toUpperCase()}</span>
                )}
                {conversation.partnerIsOnline && (
                  <span className="online-indicator"></span>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <span className="conversation-name">
                    {conversation.partnerDisplayName || conversation.partnerUsername}
                  </span>
                  <span className="conversation-time">
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="conversation-preview">
                  <span className="preview-text">
                    {conversation.lastMessage?.isOwnMessage && 'You: '}
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">{conversation.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default ConversationList;
import React from 'react';
import './MessagesSection.css';

function TypingIndicator({ username, avatarUrl }) {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} />
        ) : (
          <span>{username?.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="typing-bubble">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
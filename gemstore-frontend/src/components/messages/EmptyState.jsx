import React from 'react';
import './MessagesSection.css';

function EmptyState() {
  return (
    <div className="messages-empty-state">
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
        </svg>
      </div>
      <h3>Your Messages</h3>
      <p>Send private messages to buyers and sellers.</p>
      <p className="empty-hint">Select a conversation from the left to start chatting.</p>
    </div>
  );
}

export default EmptyState;
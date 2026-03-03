import React, { useState, useRef, useEffect } from 'react';
import './MessagesSection.css';

function MessageInput({ 
  onSendMessage, 
  onTyping, 
  disabled, 
  sending,
  placeholder = 'Type a message...',
  defaultMessage = '',
  onMessageChange,
}) {
  // Initialize with defaultMessage
  const [message, setMessage] = useState(defaultMessage);
  const textareaRef = useRef(null);

  // Focus and resize on mount if there's a default message
  useEffect(() => {
    if (defaultMessage && textareaRef.current) {
      textareaRef.current.focus();
      // Use requestAnimationFrame for reliable resize
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
      });
    }
  }, []); // Only on mount

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      onMessageChange?.();
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping?.();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const hasContent = message.trim().length > 0;

  return (
    <div className="message-input-container">
      <div className="message-input-wrapper">
        <button className="input-action-btn" title="Attach file" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          className="message-input"
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />

        <button className="input-action-btn" title="Emoji" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </button>
      </div>

      <button
        className={`send-button ${hasContent ? 'active' : ''}`}
        onClick={handleSubmit}
        disabled={!hasContent || disabled}
        title="Send"
        type="button"
      >
        {sending ? (
          <div className="send-spinner"></div>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        )}
      </button>
    </div>
  );
}

export default MessageInput;
import React, { useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import EmptyState from './EmptyState';
import { useMessages } from '../../hooks/useMessages';
import './MessagesSection.css';

function MessagesSection({ onMessagesRead, onUserClick }) {  // ✅ Add onUserClick prop
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    typingUsers,
    isConnected,
    selectConversation,
    sendMessage,
    sendTyping,
  } = useMessages();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Clear unread count when component mounts
  useEffect(() => {
    onMessagesRead?.();
  }, [onMessagesRead]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isPartnerTyping = activeConversation 
    ? typingUsers[activeConversation.partnerId] 
    : false;

  // Handle back button on mobile
  const handleBack = () => {
    selectConversation(null);
  };

  // ✅ Handle profile click - navigate to user's profile
  const handleProfileClick = () => {
    if (activeConversation && onUserClick) {
      onUserClick(activeConversation.partnerId);
    }
  };

  return (
    <div className={`messages-layout ${activeConversation ? 'chat-open' : ''}`}>
      <ConversationList
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={selectConversation}
        loading={loading && conversations.length === 0}
      />

      {activeConversation ? (
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          loading={loading}
          sending={sending}
          isTyping={isPartnerTyping}
          isConnected={isConnected}
          onSendMessage={sendMessage}
          onTyping={sendTyping}
          onBack={isMobile ? handleBack : null}
          onProfileClick={handleProfileClick}  // ✅ Pass profile click handler
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default MessagesSection;
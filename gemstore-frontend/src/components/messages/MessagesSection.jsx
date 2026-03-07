import React, { useEffect, useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import EmptyState from './EmptyState';
import { useMessages } from '../../hooks/useMessages';
import './MessagesSection.css';

function MessagesSection({ 
  onMessagesRead, 
  onUserClick, 
  inquiryData, 
  onInquiryHandled 
}) {
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    typingUsers,
    isConnected,
    conversationsLoaded,
    selectConversation,
    sendMessage,
    sendTyping,
  } = useMessages();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [pendingListing, setPendingListing] = useState(null);
  const [pendingMessage, setPendingMessage] = useState('');
  const [processedInquiryKey, setProcessedInquiryKey] = useState(null);

  // Clear unread count when component mounts
  useEffect(() => {
    onMessagesRead?.();
  }, [onMessagesRead]);

  // Process inquiry data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!inquiryData || !inquiryData.sellerId || !conversationsLoaded) {
      return;
    }

    const inquiryKey = `${inquiryData.sellerId}-${inquiryData.listing?.id || 'direct'}`;
    
    if (processedInquiryKey === inquiryKey) {
      return;
    }

    console.log('🚀 Processing inquiry:', inquiryKey);

    const { sellerId, sellerName, sellerAvatar, listing, isDirectMessage } = inquiryData;

    // ✅ Only set pending listing if there's a listing (not direct message)
    if (listing && !isDirectMessage) {
      setPendingListing(listing);
      setPendingMessage('Is this still available?');
    } else {
      // Direct message - no pre-filled content
      setPendingListing(null);
      setPendingMessage('');
    }

    setProcessedInquiryKey(inquiryKey);

    // Select conversation
    const existingConversation = conversations.find(
      (c) => Number(c.partnerId) === Number(sellerId)
    );

    if (existingConversation) {
      selectConversation(existingConversation);
    } else {
      selectConversation({
        partnerId: sellerId,
        partnerUsername: sellerName,
        partnerDisplayName: sellerName,
        partnerAvatarUrl: sellerAvatar,
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        isNew: true,
      });
    }

    // Clear parent's inquiry data
    onInquiryHandled?.();

  }, [inquiryData, conversationsLoaded, conversations]);

  // Reset when inquiry data clears
  useEffect(() => {
    if (!inquiryData && processedInquiryKey) {
      setProcessedInquiryKey(null);
    }
  }, [inquiryData, processedInquiryKey]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Enhanced send message with listing data
  const handleSendMessage = async (content, messageType = 'TEXT', listingId = null) => {
    // If we have a pending listing, include it in the message
    if (pendingListing && messageType === 'LISTING') {
      const result = await sendMessage(content, 'LISTING', listingId, pendingListing);
      return result;
    }
    return sendMessage(content, messageType, listingId);
  };

  const handleClearPendingListing = () => {
    setPendingListing(null);
    setPendingMessage('');
  };

  const handleClearPendingMessage = () => {
    setPendingMessage('');
  };

  const handleBack = () => {
    selectConversation(null);
    setPendingListing(null);
    setPendingMessage('');
  };

  const handleProfileClick = () => {
    if (activeConversation && onUserClick) {
      onUserClick(activeConversation.partnerId);
    }
  };

  const handleSelectConversation = (conv) => {
    selectConversation(conv);
    setPendingListing(null);
    setPendingMessage('');
  };

  const isPartnerTyping = activeConversation
    ? typingUsers[activeConversation.partnerId]
    : false;

  return (
    <div className={`messages-layout ${activeConversation ? 'chat-open' : ''}`}>
      <ConversationList
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
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
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          onBack={isMobile ? handleBack : null}
          onProfileClick={handleProfileClick}
          pendingListing={pendingListing}
          onClearPendingListing={handleClearPendingListing}
          pendingMessage={pendingMessage}
          onClearPendingMessage={handleClearPendingMessage}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

export default MessagesSection;
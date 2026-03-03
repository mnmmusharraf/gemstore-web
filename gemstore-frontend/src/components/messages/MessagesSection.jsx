import React, { useEffect, useState, useRef, useMemo } from 'react';
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
    selectConversation,
    sendMessage,
    sendTyping,
  } = useMessages();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Track which inquiry we've processed
  const processedInquiryRef = useRef(null);
  const inquiryProcessingRef = useRef(false);

  // ✅ Derive pending listing and message from inquiryData (no state needed)
  const pendingListing = useMemo(() => {
    if (!inquiryData?.listing) return null;
    return inquiryData.listing;
  }, [inquiryData]);

  const pendingMessage = useMemo(() => {
    if (!inquiryData?.listing) return '';
    const listing = inquiryData.listing;
    return `Hi! I'm interested in your listing:\n\n💎 ${listing.title}\n💰 ${listing.formattedPrice || `${listing.currency} ${listing.price}`}\n\nIs this still available?`;
  }, [inquiryData]);

  // Clear unread count when component mounts
  useEffect(() => {
    onMessagesRead?.();
  }, [onMessagesRead]);

  // ✅ Process inquiry data - select/create conversation
  useEffect(() => {
    if (!inquiryData || !inquiryData.sellerId || loading) return;
    
    const inquiryKey = `${inquiryData.sellerId}-${inquiryData.listing?.id || 'none'}`;
    
    // Don't process the same inquiry twice
    if (processedInquiryRef.current === inquiryKey || inquiryProcessingRef.current) {
      return;
    }

    inquiryProcessingRef.current = true;
    processedInquiryRef.current = inquiryKey;

    const { sellerId, sellerName, sellerAvatar } = inquiryData;

    // Use setTimeout to avoid synchronous setState warning
    setTimeout(() => {
      // Find existing conversation
      const existingConversation = conversations.find(
        (c) => Number(c.partnerId) === Number(sellerId)
      );

      if (existingConversation) {
        selectConversation(existingConversation);
      } else {
        // Create new temporary conversation
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

      inquiryProcessingRef.current = false;
      
      // Clear parent's inquiry data after conversation is selected
      onInquiryHandled?.();
    }, 0);

  }, [inquiryData, loading, conversations, selectConversation, onInquiryHandled]);

  // Reset processed ref when component receives null inquiryData
  useEffect(() => {
    if (!inquiryData) {
      const timer = setTimeout(() => {
        processedInquiryRef.current = null;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inquiryData]);

  // Handle resize for mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleClearPendingListing = () => {
    // This will clear via onInquiryHandled
    onInquiryHandled?.();
  };

  const handleClearPendingMessage = () => {
    onInquiryHandled?.();
  };

  const handleBack = () => {
    selectConversation(null);
    onInquiryHandled?.();
  };

  const handleProfileClick = () => {
    if (activeConversation && onUserClick) {
      onUserClick(activeConversation.partnerId);
    }
  };

  const handleSelectConversation = (conv) => {
    selectConversation(conv);
    onInquiryHandled?.();
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
          onSendMessage={sendMessage}
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
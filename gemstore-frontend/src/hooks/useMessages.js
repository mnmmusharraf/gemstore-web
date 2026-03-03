import { useState, useEffect, useCallback, useRef } from 'react';
import messageService from '../api/messageService';
import messageSocket from '../api/messageSocket';
import { getAuthToken } from '../api/config';

export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);  // ✅ Start as true
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);  // ✅ NEW
  
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);

  // Keep ref in sync with state
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversations();
      if (response.success) {
        setConversations(response.data || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
      setConversationsLoaded(true);  // ✅ Mark as loaded
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Connect to WebSocket
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    messageSocket.connect(token);
    
    messageSocket.onConnect(() => {
      setIsConnected(true);
    });

    messageSocket.onDisconnect(() => {
      setIsConnected(false);
    });

    // Handle incoming messages
    messageSocket.onMessage((data) => {
      const currentConversation = activeConversationRef.current;
      
      // Add to messages if it's the active conversation
      if (currentConversation?.partnerId === data.senderId) {
        setMessages(prev => [...prev, {
          id: data.messageId,
          senderId: data.senderId,
          senderUsername: data.senderUsername,
          senderAvatarUrl: data.senderAvatarUrl,
          receiverId: data.receiverId,
          content: data.content,
          messageType: data.messageType,
          status: data.status,
          createdAt: data.timestamp,
          isOwnMessage: false,
        }]);

        // Mark as read immediately
        messageService.markAsRead(data.senderId).catch(console.error);
      }

      // Update conversations list
      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.partnerId === data.senderId);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: {
              content: data.content,
              createdAt: data.timestamp,
            },
            lastMessageAt: data.timestamp,
            unreadCount: currentConversation?.partnerId === data.senderId 
              ? 0 
              : (updated[existingIndex].unreadCount || 0) + 1,
          };
          return updated.sort((a, b) => 
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          );
        }
        
        return prev;
      });

      // Update total unread count
      if (currentConversation?.partnerId !== data.senderId) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Handle typing indicators
    messageSocket.onTyping((data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.senderId]: data.isTyping,
      }));

      // Auto-clear typing indicator after 3 seconds
      if (data.isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.senderId]: false,
          }));
        }, 3000);
      }
    });

    // Handle status updates
    messageSocket.onStatus((data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, status: data.status }
            : msg
        )
      );
    });

    return () => {
      messageSocket.disconnect();
    };
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.getConversation(userId);
      if (response.success) {
        // Handle paginated response
        const content = response.data?.content || response.data || [];
        setMessages(Array.isArray(content) ? [...content].reverse() : []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a conversation
  const selectConversation = useCallback(async (conversation) => {
    // Allow deselecting (for mobile back button)
    if (!conversation) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    setActiveConversation(conversation);
    await loadMessages(conversation.partnerId);
    
    // Mark messages as read
    try {
      await messageService.markAsRead(conversation.partnerId);
      setConversations(prev => 
        prev.map(c => 
          c.partnerId === conversation.partnerId 
            ? { ...c, unreadCount: 0 }
            : c
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, [loadMessages]);
  
  // Send a message
  const sendMessage = useCallback(async (content, messageType = 'TEXT', listingId = null) => {
    if (!activeConversation || !content.trim()) return;

    try {
      setSending(true);
      setError(null);
      const response = await messageService.sendMessage(
        activeConversation.partnerId,
        content,
        messageType,
        listingId
      );

      if (response.success) {
        // Add message to list
        setMessages(prev => [...prev, response.data]);
        
        // Update conversation in list
        setConversations(prev => {
          const updated = prev.map(c => 
            c.partnerId === activeConversation.partnerId
              ? { ...c, lastMessage: response.data, lastMessageAt: response.data.createdAt }
              : c
          );
          // Move to top
          return updated.sort((a, b) => 
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
          );
        });
      }

      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [activeConversation]);

  // Send typing indicator (debounced)
  const sendTyping = useCallback((isTyping) => {
    if (!activeConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    messageService.sendTypingIndicator(activeConversation.partnerId, isTyping)
      .catch(console.error);

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        messageService.sendTypingIndicator(activeConversation.partnerId, false)
          .catch(console.error);
      }, 2000);
    }
  }, [activeConversation]);

  // Initial load
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadConversations();
      loadUnreadCount();
    }
  }, [loadConversations, loadUnreadCount]);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    sending,
    error,
    typingUsers,
    unreadCount,
    isConnected,
    conversationsLoaded,  // ✅ NEW: Export this
    selectConversation,
    sendMessage,
    sendTyping,
    loadConversations,
    loadUnreadCount,
  };
}

export default useMessages;
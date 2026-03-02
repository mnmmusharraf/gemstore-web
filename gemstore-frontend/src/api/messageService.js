import { API_BASE_URL, getAuthHeaders, handleResponse } from './config';

const messageService = {
  /**
   * Send a new message
   */
  sendMessage: async (receiverId, content, messageType = 'TEXT', listingId = null) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        receiverId,
        content,
        messageType,
        listingId,
      }),
    });
    return handleResponse(response);
  },

  /**
   * Get all conversations for current user
   */
  getConversations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/conversations`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get messages with a specific user
   */
  getConversation: async (userId, page = 0, size = 50) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/messages/conversations/${userId}?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Mark messages from a user as read
   */
  markAsRead: async (userId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/messages/conversations/${userId}/read`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Send typing indicator
   */
  sendTypingIndicator: async (userId, isTyping) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/messages/conversations/${userId}/typing?isTyping=${isTyping}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Get unread message count
   */
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Get unread count from specific user
   */
  getUnreadCountFromUser: async (userId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/messages/unread-count/${userId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  /**
   * Delete a message
   */
  deleteMessage: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Search messages
   */
  searchMessages: async (query, partnerId = null) => {
    let url = `${API_BASE_URL}/api/v1/messages/search?query=${encodeURIComponent(query)}`;
    if (partnerId) {
      url += `&partnerId=${partnerId}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  /**
   * Share a listing via message
   */
  shareListing: async (receiverId, listingId, message = '') => {
    const params = new URLSearchParams({
      receiverId,
      listingId,
      ...(message && { message }),
    });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/messages/share-listing?${params}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

export default messageService;
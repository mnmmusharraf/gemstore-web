import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from './config';

class MessageSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.onMessageCallback = null;
    this.onTypingCallback = null;
    this.onStatusCallback = null;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
  }

  connect(token) {
    if (this.client?.connected) {
      console.log('[MessageSocket] Already connected');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('[MessageSocket]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log('[MessageSocket] Connected');
      this.subscribeToMessages();
      this.subscribeToTyping();
      this.subscribeToStatus();
      this.onConnectCallback?.();
    };

    this.client.onDisconnect = () => {
      console.log('[MessageSocket] Disconnected');
      this.onDisconnectCallback?.();
    };

    this.client.onStompError = (frame) => {
      console.error('[MessageSocket] Error:', frame);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.subscriptions = {};
    }
  }

  subscribeToMessages() {
    if (!this.client?.connected) return;

    this.subscriptions.messages = this.client.subscribe(
      '/user/queue/messages',
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('[MessageSocket] New message:', data);
          this.onMessageCallback?.(data);
        } catch (err) {
          console.error('[MessageSocket] Error parsing message:', err);
        }
      }
    );
  }

  subscribeToTyping() {
    if (!this.client?.connected) return;

    this.subscriptions.typing = this.client.subscribe(
      '/user/queue/typing',
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('[MessageSocket] Typing:', data);
          this.onTypingCallback?.(data);
        } catch (err) {
          console.error('[MessageSocket] Error parsing typing:', err);
        }
      }
    );
  }

  subscribeToStatus() {
    if (!this.client?.connected) return;

    this.subscriptions.status = this.client.subscribe(
      '/user/queue/message-status',
      (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('[MessageSocket] Status update:', data);
          this.onStatusCallback?.(data);
        } catch (err) {
          console.error('[MessageSocket] Error parsing status:', err);
        }
      }
    );
  }

  // Event handlers
  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onTyping(callback) {
    this.onTypingCallback = callback;
  }

  onStatus(callback) {
    this.onStatusCallback = callback;
  }

  onConnect(callback) {
    this.onConnectCallback = callback;
  }

  onDisconnect(callback) {
    this.onDisconnectCallback = callback;
  }

  isConnected() {
    return this.client?.connected ?? false;
  }
}

// Singleton instance
const messageSocket = new MessageSocketService();
export default messageSocket;
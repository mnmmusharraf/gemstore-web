// src/api/notificationSocket.js
import { getAuthToken, API_BASE_URL } from "./config";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectNotificationSocket = (onMessage) => {
  const token = getAuthToken();
  if (!token) {
    console.warn("No auth token, socket not connected");
    return;
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    connectHeaders: { Authorization: `Bearer ${token}` },
    debug: (msg) => console.log("[STOMP]", msg),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log("STOMP connected");
      stompClient.subscribe("/user/queue/notifications", (msg) => {
        const notification = JSON.parse(msg.body);
        onMessage(notification);
      });
    },
    onStompError: (frame) => {
      console.error("STOMP error", frame);
    },
  });

  stompClient.activate();
};

export const disconnectNotificationSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("STOMP disconnected");
  }
};

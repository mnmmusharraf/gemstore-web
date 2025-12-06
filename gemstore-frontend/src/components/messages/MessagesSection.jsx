import React from "react";
import "../../styles/MessagesSection.css";

const conversations = [
  {
    id: 1,
    name: "aurora_gems",
    lastMessage: "Is the emerald still available?",
    time: "2h",
  },
  {
    id: 2,
    name: "bluecore_stones",
    lastMessage: "Can you share certification details?",
    time: "1d",
  },
];

function MessagesSection() {
  return (
    <div className="messages-layout">
      <div className="messages-sidebar">
        <div className="messages-header">Inbox</div>
        {conversations.map((c) => (
          <button key={c.id} className="messages-item">
            <div className="messages-avatar">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="messages-text">
              <div className="messages-name">{c.name}</div>
              <div className="messages-preview">{c.lastMessage}</div>
            </div>
            <div className="messages-time">{c.time}</div>
          </button>
        ))}
      </div>

      <div className="messages-main">
        <div className="messages-main-header">
          <div className="messages-main-name">Select a conversation</div>
          <div className="messages-main-sub">
            Start messaging buyers and sellers securely.
          </div>
        </div>
        <div className="messages-main-empty">
          <p>No conversation selected.</p>
          <p>Choose a chat from the left to start messaging.</p>
        </div>
      </div>
    </div>
  );
}

export default MessagesSection;
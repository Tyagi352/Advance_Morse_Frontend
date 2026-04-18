import React, { useEffect, useRef } from "react";
import ChatInputBar from "./ChatInputBar";

function fmt(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ msg }) {
  const isSent = msg.type === "sent";
  return (
    <div className={`cmsg-wrapper ${isSent ? "sent" : "received"}`}>
      <div className="cmsg-bubble">
        {!isSent && <div className="cmsg-sender">{msg.fromUsername}</div>}
        <div className="cmsg-text">{msg.decoded}</div>
        <div className="cmsg-morse">
          <span className="cmsg-morse-label">MORSE</span>
          {msg.morse}
        </div>
      </div>
      <div className="cmsg-meta">
        <span className="cmsg-time">{fmt(msg.timestamp)}</span>
        {isSent && <span className="cmsg-tick">✓✓</span>}
      </div>
    </div>
  );
}

export default function ChatWindow({ selectedUser, messages, onlineUsers, onSend }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isOnline = selectedUser && onlineUsers.includes(selectedUser.id);

  if (!selectedUser) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="chat-window-empty-inner">
          <div className="chat-empty-icon">📡</div>
          <h3>Select a user to start chatting</h3>
          <p>Messages are transmitted as Morse code and decoded automatically.</p>
          <div className="chat-morsebadge">· · · — — — · · ·</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-win-header">
        <div className="chat-avatar" style={{ width: 40, height: 40, fontSize: 18 }}>
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div className="chat-win-header-info">
          <div className="chat-win-name">{selectedUser.username}</div>
          <div className={`chat-win-status${isOnline ? " online" : ""}`}>
            {isOnline ? "● Online" : "○ Offline"}
          </div>
        </div>
        <div className="chat-enc-badge">📡 Morse Encoded</div>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages" role="log" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat-messages-empty">
            <span style={{ fontSize: 32 }}>👋</span>
            <p>
              Start a conversation with{" "}
              <strong>{selectedUser.username}</strong>.
              <br />Messages travel as Morse code!
            </p>
          </div>
        )}
        {messages.map(m => <MessageBubble key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInputBar selectedUser={selectedUser} onSend={onSend} />
    </div>
  );
}

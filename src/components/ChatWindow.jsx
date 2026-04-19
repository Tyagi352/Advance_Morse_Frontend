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

function LoadingDots() {
  return (
    <div className="chat-loading-wrap">
      <div className="chat-loading-dots">
        <span className="chat-dot"></span>
        <span className="chat-dot"></span>
        <span className="chat-dot"></span>
      </div>
      <p className="chat-loading-text">Loading messages...</p>
    </div>
  );
}

export default function ChatWindow({ selectedUser, messages, onlineUsers, onSend, onBackClick, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isOnline = selectedUser && onlineUsers.includes(selectedUser.id);

  if (!selectedUser) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="chat-window-empty-inner">
          <div className="chat-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
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
        <button className="chat-back-btn" onClick={onBackClick} title="Back to users">
          ← Back
        </button>
        <div className="chat-avatar" style={{ width: 40, height: 40, fontSize: 18 }}>
          {selectedUser.username[0].toUpperCase()}
        </div>
        <div className="chat-win-header-info">
          <div className="chat-win-name">{selectedUser.username}</div>
          <div className={`chat-win-status${isOnline ? " online" : ""}`}>
            {isOnline ? "● Online" : "○ Offline"}
          </div>
        </div>
        <div className="chat-enc-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Encrypted
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" id="chat-messages" role="log" aria-live="polite">
        {loading ? (
          <LoadingDots />
        ) : messages.length === 0 ? (
          <div className="chat-messages-empty">
            <span style={{ fontSize: 28, opacity: 0.4 }}>💬</span>
            <p>
              Start a conversation with{" "}
              <strong>{selectedUser.username}</strong>.
              <br />Messages travel as Morse code!
            </p>
          </div>
        ) : (
          messages.map(m => <MessageBubble key={m.id} msg={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInputBar selectedUser={selectedUser} onSend={onSend} />
    </div>
  );
}

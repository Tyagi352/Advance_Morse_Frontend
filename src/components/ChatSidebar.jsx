import React, { useState } from "react";

export default function ChatSidebar({ users, onlineUsers, selectedUser, onSelectUser, onBack, loading }) {
  const [search, setSearch] = useState("");

  const isOnline = (id) => onlineUsers.includes(id);

  const filtered = users
    .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (isOnline(a.id) && !isOnline(b.id)) return -1;
      if (!isOnline(a.id) && isOnline(b.id))  return  1;
      return a.username.localeCompare(b.username);
    });

  const onlineCount = onlineUsers.length;

  return (
    <aside className="chat-sidebar">
      {/* Header */}
      <div className="chat-sidebar-header">
        <button className="chat-sidebar-back-btn" onClick={onBack} title="Back to dashboard">
          ←
        </button>
        <h2 className="chat-sidebar-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat
        </h2>
        <span className="chat-online-badge">
          {onlineCount > 0 ? `${onlineCount} online` : "0 online"}
        </span>
      </div>

      {/* Search */}
      <div className="chat-search-wrap">
        <span className="chat-search-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          className="chat-search-input"
          type="search"
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* User list */}
      <div className="chat-user-list">
        {loading ? (
          <div className="chat-empty-list">
            <div className="chat-loading-dots" style={{ justifyContent: 'center', marginBottom: 8 }}>
              <span className="chat-dot"></span>
              <span className="chat-dot"></span>
              <span className="chat-dot"></span>
            </div>
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <p className="chat-empty-list">
            {users.length === 0
              ? "No other users registered."
              : "No results."}
          </p>
        ) : (
          filtered.map(u => (
            <div
              key={u.id}
              id={`chat-user-${u.id}`}
              className={`chat-user-row${selectedUser?.id === u.id ? " active" : ""}`}
              onClick={() => onSelectUser(u)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onSelectUser(u)}
            >
              <div className="chat-avatar-wrap">
                <div className="chat-avatar">{u.username[0].toUpperCase()}</div>
                {isOnline(u.id) && <span className="chat-online-dot" />}
              </div>
              <div>
                <div className="chat-user-name">{u.username}</div>
                <div className="chat-user-sub">
                  {isOnline(u.id) ? "● Online" : "○ Offline"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

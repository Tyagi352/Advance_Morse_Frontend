import React, { useState } from "react";

export default function ChatSidebar({ users, onlineUsers, selectedUser, onSelectUser }) {
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
        <h2 className="chat-sidebar-title">💬 Chat</h2>
        <span className="chat-online-badge">
          {onlineCount > 0 ? `${onlineCount} online` : "No one online"}
        </span>
      </div>

      {/* Search */}
      <div className="chat-search-wrap">
        <span className="chat-search-icon">🔍</span>
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
        {filtered.length === 0 && (
          <p className="chat-empty-list">
            {users.length === 0
              ? "No other users registered."
              : "No results."}
          </p>
        )}
        {filtered.map(u => (
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
                {isOnline(u.id) ? "🟢 Online" : "⚫ Offline"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

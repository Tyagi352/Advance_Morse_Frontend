/**
 * ChatPage.jsx — Real-time Morse code chat with persistent DB storage.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { decodeFromMorse } from "./utils/morse";

import { API_BASE, SOCKET_URL, LANGUAGES } from "./config";

export default function ChatPage({ token }) {
  const navigate = useNavigate();
  const [socket,       setSocket]       = useState(null);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [users,        setUsers]        = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [allMessages,  setAllMessages]  = useState({});
  const [loadingChat,  setLoadingChat]  = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const socketRef = useRef(null);

  // ── Connect Socket.IO ─────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const sock = io(SOCKET_URL, {
      auth:       { token },
      transports: ["websocket"],
    });

    sock.on("connect", () => console.log("Socket connected"));
    sock.on("online_users", (ids) => setOnlineUsers(ids));
    sock.on("private_message", (msg) => {
      const decoded = msg.decoded || decodeFromMorse(msg.morse, msg.language);
      setAllMessages(prev => ({
        ...prev,
        [msg.from]: [
          ...(prev[msg.from] ?? []),
          { id: `recv_${msg.timestamp}`, type: "received", ...msg, decoded, language: msg.language || "english" },
        ],
      }));
    });
    sock.on("connect_error", (err) =>
      console.error("Socket error:", err.message)
    );

    socketRef.current = sock;
    setSocket(sock);

    return () => { sock.disconnect(); socketRef.current = null; };
  }, [token]);

  // ── Fetch registered users ─────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoadingUsers(true);
    fetch(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data); })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [token]);

  // ── Load chat history from DB when selecting a user ────────
  const loadChatHistory = useCallback(async (userId) => {
    if (!token || allMessages[userId]) return; // already loaded
    setLoadingChat(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/history/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const history = await res.json();
        setAllMessages(prev => ({
          ...prev,
          [userId]: history,
        }));
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setLoadingChat(false);
    }
  }, [token, allMessages]);

  const handleSelectUser = useCallback((user) => {
    setSelectedUser(user);
    loadChatHistory(user.id);
  }, [loadChatHistory]);

  // ── Send a message (also send decoded text to backend for DB) ──
  const sendMessage = (decoded, recipientId, morse, audio = null, language = "english") => {
    if (!socketRef.current) return;
    const ts = Date.now();
    socketRef.current.emit("private_message", { to: recipientId, morse, decoded, timestamp: ts, audio, language });
    setAllMessages(prev => ({
      ...prev,
      [recipientId]: [
        ...(prev[recipientId] ?? []),
        { id: `sent_${ts}`, type: "sent", from: null, fromUsername: "You", decoded, morse, timestamp: ts, language },
      ],
    }));
  };

  const msgs = selectedUser ? (allMessages[selectedUser.id] ?? []) : [];

  return (
    <div className="chat-page-root">
      <ChatSidebar
        users={users}
        onlineUsers={onlineUsers}
        selectedUser={selectedUser}
        onSelectUser={handleSelectUser}
        onBack={() => navigate("/dashboard")}
        loading={loadingUsers}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={msgs}
        onlineUsers={onlineUsers}
        onSend={(decoded, morse, audio, language) =>
          selectedUser && sendMessage(decoded, selectedUser.id, morse, audio, language)
        }
        onBackClick={() => setSelectedUser(null)}
        loading={loadingChat}
        API_BASE={API_BASE}
        languages={LANGUAGES}
      />
    </div>
  );
}

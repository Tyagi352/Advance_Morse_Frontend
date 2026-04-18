/**
 * ChatPage.jsx — Real-time Morse code chat.
 * Plugs into the existing app: uses localStorage "token" for JWT auth,
 * connects to Flask-SocketIO on the same port 5000.
 */
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ChatSidebar from "./components/ChatSidebar";
import ChatWindow from "./components/ChatWindow";
import { decodeFromMorse } from "./utils/morse";

const API_BASE   = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

export default function ChatPage({ token }) {
  const [socket,       setSocket]       = useState(null);
  const [onlineUsers,  setOnlineUsers]  = useState([]);
  const [users,        setUsers]        = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  // allMessages: { [userId]: Message[] }
  const [allMessages,  setAllMessages]  = useState({});
  const socketRef = useRef(null);

  // ── Connect Socket.IO ──────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const sock = io(SOCKET_URL, {
      auth:       { token },
      transports: ["websocket"],
    });

    sock.on("connect", () => console.log("Socket connected"));
    sock.on("online_users", (ids) => setOnlineUsers(ids));
    sock.on("private_message", (msg) => {
      const decoded = decodeFromMorse(msg.morse);
      setAllMessages(prev => ({
        ...prev,
        [msg.from]: [
          ...(prev[msg.from] ?? []),
          { id: `recv_${msg.timestamp}`, type: "received", ...msg, decoded },
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
    fetch(`${API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => Array.isArray(data) && setUsers(data))
      .catch(console.error);
  }, [token]);

  // ── Send a message ─────────────────────────────────────────
  const sendMessage = (decoded, recipientId, morse) => {
    if (!socketRef.current) return;
    const ts = Date.now();
    socketRef.current.emit("private_message", { to: recipientId, morse, timestamp: ts });
    setAllMessages(prev => ({
      ...prev,
      [recipientId]: [
        ...(prev[recipientId] ?? []),
        { id: `sent_${ts}`, type: "sent", from: null, fromUsername: "You", decoded, morse, timestamp: ts },
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
        onSelectUser={setSelectedUser}
      />
      <ChatWindow
        selectedUser={selectedUser}
        messages={msgs}
        onlineUsers={onlineUsers}
        onSend={(decoded, morse) =>
          selectedUser && sendMessage(decoded, selectedUser.id, morse)
        }
      />
    </div>
  );
}

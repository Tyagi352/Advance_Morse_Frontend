import React, { useState, useEffect, useRef } from "react";
import { encodeToMorse } from "../utils/morse";

export default function ChatInputBar({ selectedUser, onSend }) {
  const [text,    setText]    = useState("");
  const [preview, setPreview] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    setPreview(text.trim() ? encodeToMorse(text) : "");
  }, [text]);

  // Reset when conversation switches
  useEffect(() => {
    setText("");
    setPreview("");
    ref.current?.focus();
  }, [selectedUser?.id]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, encodeToMorse(trimmed));
    setText("");
    setPreview("");
    ref.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    // auto-resize
    const el = ref.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 120)}px`; }
  };

  return (
    <div className="chat-input-area">
      {preview && (
        <div className="chat-morse-preview">
          <span className="chat-morse-label">MORSE</span>
          <span className="chat-morse-code">{preview}</span>
        </div>
      )}
      <div className="chat-input-row">
        <textarea
          id="chat-message-input"
          ref={ref}
          className="chat-textarea"
          placeholder={`Message ${selectedUser?.username ?? "…"} (Enter to send)`}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          autoFocus
        />
        <button
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!text.trim()}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

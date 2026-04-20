import React, { useState, useEffect, useRef } from "react";
import { encodeToMorse } from "../utils/morse";

export default function ChatInputBar({ selectedUser, onSend }) {
  const [text,    setText]    = useState("");
  const [preview, setPreview] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const ref = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setPreview(text.trim() ? encodeToMorse(text) : "");
  }, [text]);

  // Reset when conversation switches
  useEffect(() => {
    setText("");
    setPreview("");
    ref.current?.focus();
  }, [selectedUser?.id]);

  const handleSend = (audioBlob = null) => {
    const trimmed = text.trim();
    if (!trimmed && !audioBlob) return;
    
    // onSend signature: (decoded, recipientId, morse, audio)
    // Note: ChatPage provides onSend as (decoded, morse) or similar? 
    // Let's check how onSend is passed in ChatWindow and ChatPage.
    onSend(trimmed, encodeToMorse(trimmed), audioBlob);
    
    setText("");
    setPreview("");
    ref.current?.focus();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      // Try audio/mp4 if possible, fallback to standard
      const options = { mimeType: "audio/webm" };
      if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options.mimeType = "audio/mp4";
      }

      const recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        handleSend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      // Start Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setText(prev => (prev + " " + transcript).trim());
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
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
        <button 
          className={`chat-voice-btn ${isRecording ? "recording" : ""}`}
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop Recording" : "Voice Message"}
        >
          {isRecording ? "⏹" : "🎤"}
        </button>
        <textarea
          id="chat-message-input"
          ref={ref}
          className="chat-textarea"
          placeholder={isRecording ? "Listening..." : `Message ${selectedUser?.username ?? "…"} (Enter to send)`}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isRecording}
        />
        <button
          id="chat-send-btn"
          className="chat-send-btn"
          onClick={() => handleSend()}
          disabled={!text.trim() || isRecording}
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

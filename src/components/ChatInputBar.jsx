import React, { useState, useEffect, useRef } from "react";
import { encodeToMorse, strictEncodeToMorse } from "../utils/morse";

export default function ChatInputBar({ selectedUser, onSend, languages }) {
  const [text,    setText]    = useState("");
  const [preview, setPreview] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  
  const ref = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    try {
      setPreview(text.trim() ? strictEncodeToMorse(text, language) : "");
    } catch (err) {
      setPreview("Error: " + err.message);
    }
  }, [text, language]);

  // Reset when conversation switches
  useEffect(() => {
    setText("");
    setPreview("");
    ref.current?.focus();
  }, [selectedUser?.id]);

  const handleSend = (audioBlob = null) => {
    const trimmed = text.trim();
    if (!trimmed && !audioBlob) return;
    
    let morse = "";
    try {
      morse = trimmed ? strictEncodeToMorse(trimmed, language) : "";
    } catch (err) {
      alert(err.message);
      return;
    }

    onSend(trimmed, morse, audioBlob, language);
    
    setText("");
    setPreview("");
    ref.current?.focus();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
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
        
        // Find speech code from centralized languages list
        const selectedLangObj = languages.find(l => l.id === language);
        recognition.lang = selectedLangObj ? selectedLangObj.speechCode : "en-US";

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
      {/* Language Selection Pills */}
      <div className="flex items-center gap-1.5 mb-3 overflow-x-auto hide-scrollbar pb-1">
        {languages.map(lang => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              language === lang.id
                ? "bg-white text-[#09090B] border-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                : "bg-transparent text-[#71717A] border-[#27272A] hover:border-[#3F3F46] hover:text-[#A1A1AA]"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {preview && (
        <div className="chat-morse-preview">
          <span className="chat-morse-label">MORSE ({language})</span>
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

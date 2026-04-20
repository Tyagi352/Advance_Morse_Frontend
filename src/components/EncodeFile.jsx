import React, { useState, useRef } from "react";
import {
  FileText,
  Lock,
  UploadCloud,
  Download,
  Send,
  Mic,
  MicOff,
  StopCircle,
  Radio
} from "lucide-react";
import { strictEncodeToMorse } from "../utils/morse";

export default function EncodeFile({ token, API_BASE, setMessage, openShareModal, languages }) {
  const [text, setText] = useState("");
  const [fileToEncode, setFileToEncode] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [speechMorse, setSpeechMorse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("english");
  const recognitionRef = useRef(null);

  const handleEncode = async (content, andShare = false) => {
    if (!token) { setMessage("Please login"); return; }
    if (!content) { setMessage("Please enter text or select a file"); return; }

    try {
      const res = await fetch(`${API_BASE}/encode`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: content, language }),
      });

      if (res.ok) {
        const blob = await res.blob();
        if (andShare) {
          const f = new File([blob], "morse.enc", { type: "application/octet-stream" });
          openShareModal(f);
        } else {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "morse.enc"; a.click();
          window.URL.revokeObjectURL(url);
          setMessage("Text encoded & downloaded!");
        }
      } else {
        const data = await res.json();
        setMessage(data.error || "Encoding failed");
      }
    } catch { setMessage("Server error"); }
  };

  const encodeText = (andShare = false) => handleEncode(text, andShare);
  
  const encodeTextFile = async (andShare = false) => {
    if (!fileToEncode) return;
    handleEncode(await fileToEncode.text(), andShare);
  };

  const getLanguageTag = (langId) => {
    const langObj = languages.find(l => l.id === langId);
    return langObj ? langObj.speechCode : "en-US";
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Speech API not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = getLanguageTag(language);
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
      setMessage("");
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setRecognizedText(currentTranscript);

      try {
        const morse = strictEncodeToMorse(currentTranscript, language);
        setSpeechMorse(morse);
      } catch (err) {
        setSpeechMorse("");
        setMessage(err.message || "Unsupported character detected");
        recognition.stop();
        setIsRecording(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setMessage("Microphone error or permission denied.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error(e);
      setMessage("Failed to start recording.");
    }
  };

  const encodeVoiceText = (andShare = false) => {
    handleEncode(recognizedText, andShare);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Encode & Encrypt</h1>
        <p className="text-[#71717A] text-[14px]">Convert text or files into layered secure Morse Code format.</p>
      </div>
      
      {/* Language Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {languages.map(lang => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all whitespace-nowrap ${
              language === lang.id
                ? "bg-white text-[#09090B]"
                : "bg-[#18181B] text-[#71717A] border border-[#27272A] hover:border-[#3F3F46] hover:text-white"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Encoding */}
        <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group">
          <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2.5">
            <div className="p-1.5 bg-[#27272A] rounded-md group-hover:bg-white group-hover:text-[#09090B] transition-all">
              <FileText className="text-white group-hover:text-[#09090B]" size={16} />
            </div>
            Text Encoding
          </h2>
          <textarea
            placeholder="Type your sensitive message here..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full p-3.5 rounded-lg bg-[#09090B] text-[#E4E4E7] border border-[#27272A] focus:outline-none focus:ring-1 focus:ring-[#3F3F46] focus:border-[#3F3F46] h-36 resize-none transition-all placeholder-[#52525B] text-[14px] mb-4"
          />
          <div className="flex gap-3">
            <button onClick={() => encodeText(false)} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-[#27272A] border border-[#3F3F46] rounded-lg hover:bg-[#3F3F46] transition-all text-[13px] btn-lift">
              <Download size={14} /> Encode & Download
            </button>
            <button onClick={() => encodeText(true)} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all text-[13px] btn-lift">
              <Send size={14} /> Encode & Share
            </button>
          </div>
        </div>

        {/* File Encoding */}
        <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2.5">
              <div className="p-1.5 bg-[#27272A] rounded-md group-hover:bg-white group-hover:text-[#09090B] transition-all">
                <Lock className="text-white group-hover:text-[#09090B]" size={16} />
              </div>
              File Encoding
            </h2>
            <div className="border border-dashed border-[#27272A] group-hover:border-[#3F3F46] rounded-xl p-6 mb-4 text-center hover:bg-white/[0.02] transition-all relative cursor-pointer bg-[#09090B]">
              <input
                type="file"
                accept=".txt"
                onChange={e => setFileToEncode(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="mx-auto h-8 w-8 text-[#52525B] group-hover:text-white transition-colors mb-2" />
              <p className="text-[13px] text-[#71717A]">
                {fileToEncode ? (
                  <span className="text-white font-medium">{fileToEncode.name}</span>
                ) : (
                  <>Drop or <span className="text-white font-medium">browse</span> .txt file</>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => encodeTextFile(false)} disabled={!fileToEncode} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-[#27272A] border border-[#3F3F46] rounded-lg hover:bg-[#3F3F46] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
              <Download size={14} /> Download
            </button>
            <button onClick={() => encodeTextFile(true)} disabled={!fileToEncode} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
              <Send size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Voice Encoding */}
      <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[15px] font-semibold flex items-center gap-2 text-white">
            <Mic className="text-[#71717A]" size={16} /> Voice Encoding
          </h2>
          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                <span className="w-1 h-5 bg-white rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s]"></span>
                <span className="w-1 h-3 bg-white rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></span>
                <span className="text-white text-[11px] font-semibold ml-1.5 animate-pulse">Recording</span>
              </div>
            )}
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-3 py-1.5 font-semibold rounded-lg transition-all text-[12px] ${
                isRecording
                  ? "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                  : "bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46] hover:bg-[#3F3F46] hover:text-white"
              }`}
            >
              {isRecording ? <StopCircle size={14} /> : <Radio size={14} />}
              {isRecording ? "Stop" : "Record"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#52525B] mb-1.5 uppercase tracking-wider">Recognized Text</label>
            <textarea
              readOnly
              value={recognizedText}
              placeholder="Speak into your microphone..."
              className="w-full p-3 rounded-lg bg-[#09090B] text-[#E4E4E7] border border-[#27272A] focus:outline-none h-28 resize-none placeholder-[#52525B] text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#52525B] mb-1.5 uppercase tracking-wider">Morse Output</label>
            <textarea
              readOnly
              value={speechMorse}
              placeholder="Live Morse code output..."
              className="w-full p-3 rounded-lg bg-[#09090B] text-[#A1A1AA] font-mono border border-[#27272A] focus:outline-none h-28 resize-none placeholder-[#52525B] text-[12px]"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button onClick={() => encodeVoiceText(true)} disabled={!recognizedText || !speechMorse} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-[#27272A] border border-[#3F3F46] rounded-lg hover:bg-[#3F3F46] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
            <Send size={14} /> Encode & Share Voice
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ShareModal from "./components/ShareModal";
import {
  LayoutDashboard,
  Lock,
  Unlock,
  Send,
  Inbox,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  FileText,
  Clock,
  Download,
  Ban,
  UploadCloud,
  FileBadge,
  Share2,
  CheckCircle,
  Mic,
  MicOff,
  StopCircle,
  Radio
} from "lucide-react";
import { strictEncodeToMorse } from "./utils/morse";

const API_BASE = "http://localhost:5000";

export default function Dashboard({ token, setToken }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [decoded, setDecoded] = useState("");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("english");
  const [fileToEncode, setFileToEncode] = useState(null);

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState(null);

  const [users, setUsers] = useState([]);
  const [sentFiles, setSentFiles] = useState([]);
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [speechMorse, setSpeechMorse] = useState("");
  const recognitionRef = useRef(null);

  const languages = ["english", "hindi", "marathi", "french"];

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchSentFiles();
      fetchReceivedFiles();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error("Failed to fetch users", err); }
  };

  const fetchSentFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSentFiles(await res.json());
    } catch (err) { console.error("Failed to fetch sent files", err); }
  };

  const fetchReceivedFiles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReceivedFiles(await res.json());
    } catch (err) { console.error("Failed to fetch received files", err); }
  };

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

  const decodeFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);

    try {
      const res = await fetch(`${API_BASE}/decode`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setDecoded(data.decoded_text);
        setMessage("File decoded successfully!");
      } else {
        setDecoded("");
        setMessage(data.error || "Decoding failed");
      }
    } catch { setMessage("Server error"); }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      const res = await fetch(`${API_BASE}/api/files/download/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        window.URL.revokeObjectURL(url); a.remove();
      } else {
        const data = await res.json();
        setMessage(data.error || "File download failed");
      }
    } catch { setMessage("Server error during file download."); }
  };

  const openShareModal = (f) => { setFileToShare(f); setShareModalOpen(true); };

  const shareDecodedText = () => {
    const blob = new Blob([decoded], { type: "text/plain" });
    openShareModal(new File([blob], "decoded.txt", { type: "text/plain" }));
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const getLanguageTag = (lang) => {
    switch (lang) {
      case "french": return "fr-FR";
      case "hindi": return "hi-IN";
      case "marathi": return "mr-IN";
      default: return "en-US";
    }
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
      setMessage(""); // clear previous messages
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
        // Validation failed
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

  const filteredSent = sentFiles.filter(f => 
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.recipient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceived = receivedFiles.filter(f => 
    f.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "encode", label: "Encode", icon: <Lock size={20} /> },
    { id: "decode", label: "Decode", icon: <Unlock size={20} /> },
    { id: "sent", label: "Sent Files", icon: <Send size={20} /> },
    { id: "received", label: "Received Files", icon: <Inbox size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0B0F14] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0B0F14] border-r border-[#1F2937] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-[#1F2937]">
          <div className="text-[#FACC15] font-bold text-xl flex items-center gap-2">
            <Lock className="text-[#FACC15]" /> Morse Encoder
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-[#111827] text-[#FACC15] border border-[#1F2937] shadow-sm transform scale-[1.02]"
                  : "text-gray-400 hover:text-white hover:bg-[#111827] border border-transparent hover:border-[#1F2937]"
              }`}
            >
              {item.icon}
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#1F2937]">
          <button
            onClick={() => navigate("/chat")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-[#111827] border border-transparent hover:border-[#1F2937] font-semibold text-sm"
          >
            💬 Open Chat
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-[#0B0F14]/80 backdrop-blur-md border-b border-[#1F2937] flex items-center justify-between px-8 z-10">
          <div className="flex-1 max-w-xl relative hidden md:block">
            <Search className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search sent or received files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111827] text-white border border-[#1F2937] rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all placeholder-gray-500 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-6 ml-auto">
            {message && (
              <span className="text-sm font-medium text-gray-300 animate-pulse bg-[#111827] px-4 py-1.5 rounded-full border border-[#1F2937]">
                {message}
              </span>
            )}
            <button className="text-gray-400 hover:text-[#FACC15] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FACC15] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FACC15]"></span>
              </span>
            </button>
            <div className="h-8 w-px bg-[#1F2937]"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FACC15] to-orange-500 flex items-center justify-center text-black font-bold shadow-md transform group-hover:scale-105 transition-transform">
                ME
              </div>
              <ChevronDown className="text-gray-500 group-hover:text-white transition-colors" size={16} />
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            
            {/* Dashboard View (Overview/Shared File Logs) */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">Shared File Logs</h1>
                  <p className="text-gray-400 mt-1">Manage and track your end-to-end encoded file transfers.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Sent Files Summary */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-[#FACC15]/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FACC15]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-[#0B0F14] rounded-xl border border-[#1F2937]">
                        <Send className="text-[#FACC15] h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Sent Files</h2>
                        <p className="text-sm text-gray-500">{sentFiles.length} files encoded & shared</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("sent")} className="text-sm font-semibold text-[#FACC15] hover:text-white flex items-center gap-1 transition-colors">
                      View all sent files <UploadCloud size={16} />
                    </button>
                  </div>

                  {/* Received Files Summary */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-[#0B0F14] rounded-xl border border-[#1F2937]">
                        <Inbox className="text-blue-400 h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Received Files</h2>
                        <p className="text-sm text-gray-500">{receivedFiles.length} files securely received</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab("received")} className="text-sm font-semibold text-blue-400 hover:text-white flex items-center gap-1 transition-colors">
                      View all received files <Download size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" /> Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {/* Just listing top 5 recent files overall */}
                    {[...sentFiles, ...receivedFiles]
                      .sort((a, b) => new Date(b.shared_at) - new Date(a.shared_at))
                      .slice(0, 5)
                      .map((f, i) => {
                        const isSent = !!f.recipient;
                        return (
                          <div key={`activity-${i}`} className="flex items-center justify-between p-4 bg-[#0B0F14] rounded-xl border border-[#1F2937] hover:border-gray-600 transition-colors group">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${isSent ? "bg-[#FACC15]/10 text-[#FACC15]" : "bg-blue-500/10 text-blue-400"}`}>
                                {isSent ? <Send size={18} /> : <Inbox size={18} />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-200">{f.file_name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {isSent ? `Shared with ${f.recipient}` : `Received from ${f.sender}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <span className="text-xs text-gray-500">{new Date(f.shared_at).toLocaleDateString()}</span>
                              <button onClick={() => downloadFile(f.id, f.file_name)} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold hover:text-[#FACC15]">
                                Download
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {sentFiles.length === 0 && receivedFiles.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Encode View */}
            {activeTab === "encode" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Encode & Encrypt</h1>
                  <p className="text-gray-400">Convert text or files into layered secure Morse Code format.</p>
                </div>
                
                {/* Language Selector inline */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                        language === lang
                          ? "bg-[#FACC15] text-black shadow-[0_0_15px_rgba(250,204,21,0.3)] transform scale-105"
                          : "bg-[#111827] text-gray-400 border border-[#1F2937] hover:border-gray-500"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="text-[#FACC15]" size={20} /> Text Encoding
                    </h2>
                    <textarea
                      placeholder="Type your sensitive message here..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      className="w-full p-4 rounded-xl bg-[#0B0F14] text-gray-200 border border-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#FACC15] focus:border-[#FACC15] h-40 resize-none transition-all placeholder-gray-600 mb-6"
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => encodeText(false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
                        <Download size={18} /> Encode & Save
                      </button>
                      <button onClick={() => encodeText(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-[#1F2937] border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors">
                        <Send size={18} /> Encode & Share
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Lock className="text-[#FACC15]" size={20} /> File Encoding
                      </h2>
                      <div className="border-2 border-dashed border-[#1F2937] rounded-xl p-8 mb-6 text-center hover:border-gray-500 transition-colors relative cursor-pointer group bg-[#0B0F14]">
                        <input
                          type="file"
                          accept=".txt"
                          onChange={e => setFileToEncode(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-500 group-hover:text-[#FACC15] transition-colors mb-3" />
                        <p className="text-sm text-gray-400">
                          {fileToEncode ? (
                            <span className="text-[#FACC15] font-semibold">{fileToEncode.name}</span>
                          ) : (
                            <>Drag and drop or <span className="text-[#FACC15] font-semibold">browse</span> standard .txt file</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                      <button onClick={() => encodeTextFile(false)} disabled={!fileToEncode} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Download size={18} /> Encode & Save
                      </button>
                      <button onClick={() => encodeTextFile(true)} disabled={!fileToEncode} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-[#1F2937] border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send size={18} /> Encode & Share
                      </button>
                    </div>
                  </div>
                </div>

                {/* Speech to Morse Voice Encoding block */}
                <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                      <Mic className="text-[#FACC15]" size={20} /> Voice Encoding
                    </h2>
                    <div className="flex items-center gap-4">
                      {isRecording && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-4 bg-[#FACC15] rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                          <span className="w-1.5 h-6 bg-[#FACC15] rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s]"></span>
                          <span className="w-1.5 h-4 bg-[#FACC15] rounded-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></span>
                          <span className="text-[#FACC15] text-sm font-bold ml-2 animate-pulse">Recording...</span>
                        </div>
                      )}
                      <button
                        onClick={toggleRecording}
                        className={`flex items-center gap-2 px-4 py-2 font-bold rounded-xl transition-all ${
                          isRecording
                            ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                            : "bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/50 hover:bg-[#FACC15]/30"
                        }`}
                      >
                        {isRecording ? <StopCircle size={18} /> : <Radio size={18} />}
                        {isRecording ? "Stop Recording" : "Start Recording"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Recognized Text</label>
                      <textarea
                        readOnly
                        value={recognizedText}
                        placeholder="Speak into your microphone to transcribe text..."
                        className="w-full p-4 rounded-xl bg-[#0B0F14] text-gray-200 border border-[#1F2937] focus:outline-none h-32 resize-none transition-all placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-400 mb-2">Morse Code Output</label>
                      <textarea
                        readOnly
                        value={speechMorse}
                        placeholder="Live Morse code output..."
                        className="w-full p-4 rounded-xl bg-[#0B0F14] text-[#FACC15] font-mono border border-[#1F2937] focus:outline-none h-32 resize-none transition-all placeholder-gray-600"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button onClick={() => encodeVoiceText(false)} disabled={!recognizedText || !speechMorse} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Download size={18} /> Encode & Save Voice
                    </button>
                    <button onClick={() => encodeVoiceText(true)} disabled={!recognizedText || !speechMorse} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-[#1F2937] border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send size={18} /> Encode & Share Voice
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Decode View */}
            {activeTab === "decode" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Decode & Decrypt</h1>
                  <p className="text-gray-400">Restore your encrypted .enc files back to original accessible text.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Unlock className="text-[#FACC15]" size={20} /> File Decoding
                      </h2>
                      <div className="border-2 border-dashed border-[#1F2937] rounded-xl p-8 mb-6 text-center hover:border-gray-500 transition-colors relative cursor-pointer group bg-[#0B0F14]">
                        <input
                          type="file"
                          accept=".enc"
                          onChange={e => setFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileBadge className="mx-auto h-12 w-12 text-gray-500 group-hover:text-[#FACC15] transition-colors mb-3" />
                        <p className="text-sm text-gray-400">
                          {file ? (
                            <span className="text-[#FACC15] font-semibold">{file.name}</span>
                          ) : (
                            <>Drag and drop or <span className="text-[#FACC15] font-semibold">browse</span> encoded .enc file</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                      <button onClick={decodeFile} disabled={!file} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Unlock size={18} /> Decode File
                      </button>
                      <button onClick={() => openShareModal(file)} disabled={!file} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold text-white bg-[#1F2937] border border-gray-600 rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Share2 size={18} /> Share Directly
                      </button>
                    </div>
                  </div>

                  {decoded && (
                    <div className="bg-[#111827] border border-[#1F2937] p-6 rounded-2xl shadow-xl">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          <CheckCircle className="text-green-400" size={20} /> Decoded Output
                        </h2>
                        <button
                          onClick={shareDecodedText}
                          className="px-4 py-2 font-semibold text-white bg-[#1F2937] border border-gray-600 rounded-lg hover:bg-gray-700 text-sm transition-colors"
                        >
                          Share Output
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={decoded}
                        className="w-full p-4 rounded-xl bg-[#0B0F14] text-[#FACC15] font-mono border border-[#1F2937] h-40 resize-none transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sent Files View */}
            {activeTab === "sent" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Sent Files</h1>
                  <p className="text-gray-400">View and manage the encrypted files you have shared with other users.</p>
                </div>
                
                <div className="space-y-4">
                  {filteredSent.length > 0 ? filteredSent.map(f => (
                    <div key={f.id} className="bg-[#111827] border border-[#1F2937] hover:border-gray-600 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0B0F14] rounded-xl text-[#FACC15] shrink-0 border border-[#1F2937]">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-100">{f.file_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-[#FACC15]/10 text-[#FACC15] rounded-md">Sent</span>
                            <span className="text-sm text-gray-500">to <span className="text-gray-300">{f.recipient}</span></span>
                            <span className="text-gray-700 text-xs">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} /> {new Date(f.shared_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto md:ml-0">
                        <button onClick={() => downloadFile(f.id, f.file_name)} className="flex items-center gap-2 px-4 py-2 font-semibold text-sm text-[#FACC15] bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-xl hover:bg-[#FACC15]/20 transition-colors">
                          <Download size={16} /> Download
                        </button>
                        <button onClick={() => setMessage(`Revoke currently visual only for ${f.file_name}`)} className="flex items-center gap-2 px-4 py-2 font-semibold text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-xl hover:bg-red-400/20 transition-colors">
                          <Ban size={16} /> Revoke Access
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-12 text-center">
                      <Send className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-300">No sent files found</h3>
                      <p className="text-gray-500 mt-2">You haven't shared anything matching this criteria yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Received Files View */}
            {activeTab === "received" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Received Files</h1>
                  <p className="text-gray-400">Secure files shared with you by trusted peers.</p>
                </div>
                
                <div className="space-y-4">
                  {filteredReceived.length > 0 ? filteredReceived.map(f => (
                    <div key={f.id} className="bg-[#111827] border border-[#1F2937] hover:border-gray-600 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0B0F14] rounded-xl text-blue-400 shrink-0 border border-[#1F2937]">
                          <FileBadge size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-100">{f.file_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">Received</span>
                            <span className="text-sm text-gray-500">from <span className="text-gray-300">{f.sender}</span></span>
                            <span className="text-gray-700 text-xs">•</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} /> {new Date(f.shared_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-auto md:ml-0">
                        <button onClick={() => downloadFile(f.id, f.file_name)} className="flex items-center gap-2 px-4 py-2 font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20">
                          <Download size={16} /> Download
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="bg-[#111827] border border-[#1F2937] rounded-2xl p-12 text-center">
                      <Inbox className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-300">No received files found</h3>
                      <p className="text-gray-500 mt-2">Your inbox looks empty right now.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {isShareModalOpen && (
        <ShareModal
          file={fileToShare}
          token={token}
          users={users}
          onClose={() => { setShareModalOpen(false); fetchSentFiles(); }}
        />
      )}
    </div>
  );
}
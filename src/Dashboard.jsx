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
  Radio,
  ArrowUpRight,
  Activity,
  Shield
} from "lucide-react";
import { encodeWithLanguage } from "./utils/morse";

import { API_BASE } from "./constants";

export default function Dashboard({ token, setToken }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCurrentUser(await res.json());
    } catch (err) { console.error("Failed to fetch current user", err); }
  };

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
      setMessage("");
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setRecognizedText(currentTranscript);
      const morse = encodeWithLanguage(currentTranscript, language);
      setSpeechMorse(morse);
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
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "encode", label: "Encode", icon: <Lock size={18} /> },
    { id: "decode", label: "Decode", icon: <Unlock size={18} /> },
    { id: "sent", label: "Sent Files", icon: <Send size={18} /> },
    { id: "received", label: "Received", icon: <Inbox size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-[#09090B] text-white font-['Inter',sans-serif] overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className={`bg-[#09090B] border-r border-[#27272A] flex flex-col transition-all duration-300 hidden md:flex ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Logo */}
        <div className="h-[72px] flex items-center px-5 border-b border-[#27272A] justify-between">
          {sidebarOpen && (
            <div className="text-white font-bold text-[15px] flex items-center gap-2.5 tracking-tight">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Shield className="text-[#09090B]" size={16} />
              </div>
              <span>Morse Encoder</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#18181B] rounded-lg transition-colors text-[#71717A] hover:text-white flex items-center justify-center"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "≪" : "≫"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#52525B] px-3 mb-3">Navigation</p>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-white text-[#09090B] font-semibold shadow-sm"
                  : "text-[#A1A1AA] hover:text-white hover:bg-[#18181B]"
              }`}
              title={!sidebarOpen ? item.label : ""}
            >
              {item.icon}
              {sidebarOpen && <span className="text-[13px]">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Chat Button */}
        <div className="p-3 border-t border-[#27272A]">
          <button
            onClick={() => navigate("/chat")}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-[#A1A1AA] hover:text-white hover:bg-[#18181B] text-[13px] font-medium ${
              sidebarOpen ? "" : "p-2"
            }`}
            title="Open Chat"
          >
            💬
            {sidebarOpen && <span>Open Chat</span>}
          </button>
        </div>

        {/* Sidebar User & Logout */}
        <div className="p-3 border-t border-[#27272A]">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white text-xs font-bold">
                  {currentUser?.username?.substring(0, 2).toUpperCase() || "U"}
                </div>
                <span className="text-[13px] text-[#A1A1AA] font-medium truncate max-w-[120px]">{currentUser?.username || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[#52525B] hover:text-white transition-colors p-1.5 hover:bg-[#18181B] rounded-md"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center text-[#52525B] hover:text-white transition-colors p-2 hover:bg-[#18181B] rounded-md"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar */}
        <header className="h-[72px] bg-[#09090B]/90 backdrop-blur-xl border-b border-[#27272A] flex items-center justify-between px-8 z-10 shrink-0">
          <div>
            {activeTab === "dashboard" ? (
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Welcome back, {currentUser?.username || "User"}</h1>
                <p className="text-[13px] text-[#71717A] mt-0.5">Manage your encrypted transmissions</p>
              </div>
            ) : (
              <div className="flex-1 max-w-md relative hidden md:block">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#52525B]" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#18181B] text-white border border-[#27272A] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#3F3F46] focus:border-[#3F3F46] transition-all placeholder-[#52525B] text-[13px]"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            {message && (
              <span className="text-[12px] font-medium text-[#A1A1AA] animate-pulse bg-[#18181B] px-3 py-1.5 rounded-full border border-[#27272A]">
                {message}
              </span>
            )}
            <button className="text-[#52525B] hover:text-white transition-colors relative p-2 hover:bg-[#18181B] rounded-lg">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </button>
            <div className="h-6 w-px bg-[#27272A]"></div>
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-white text-xs font-bold group-hover:border-[#52525B] transition-colors">
                {currentUser?.username?.substring(0, 2).toUpperCase() || "U"}
              </div>
              <ChevronDown className="text-[#52525B] group-hover:text-white transition-colors" size={14} />
            </div>
          </div>
        </header>

        {/* ─── Scrollable Content ─── */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 pb-10">
            
            {/* ═══ Dashboard Overview ═══ */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46] group-hover:bg-white group-hover:border-white transition-all">
                        <Send className="h-4 w-4 text-white group-hover:text-[#09090B] transition-colors" />
                      </div>
                      <ArrowUpRight size={14} className="text-[#52525B]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{sentFiles.length}</p>
                    <p className="text-[12px] text-[#71717A] mt-0.5">Files Sent</p>
                  </div>
                  <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46] group-hover:bg-white group-hover:border-white transition-all">
                        <Inbox className="h-4 w-4 text-white group-hover:text-[#09090B] transition-colors" />
                      </div>
                      <ArrowUpRight size={14} className="text-[#52525B]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{receivedFiles.length}</p>
                    <p className="text-[12px] text-[#71717A] mt-0.5">Files Received</p>
                  </div>
                  <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46] group-hover:bg-white group-hover:border-white transition-all">
                        <Activity className="h-4 w-4 text-white group-hover:text-[#09090B] transition-colors" />
                      </div>
                      <ArrowUpRight size={14} className="text-[#52525B]" />
                    </div>
                    <p className="text-2xl font-bold text-white">{sentFiles.length + receivedFiles.length}</p>
                    <p className="text-[12px] text-[#71717A] mt-0.5">Total Transfers</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("sent")}
                    className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
                        <Send className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-[15px] font-semibold text-white">Sent Files</h2>
                        <p className="text-[12px] text-[#71717A]">{sentFiles.length} files encoded & shared</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#71717A] group-hover:text-white flex items-center gap-1 transition-colors mt-2">
                      View all → 
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("received")}
                    className="bg-[#18181B] border border-[#27272A] rounded-xl p-5 hover:border-[#3F3F46] transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#27272A] rounded-lg border border-[#3F3F46]">
                        <Inbox className="text-white h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-[15px] font-semibold text-white">Received Files</h2>
                        <p className="text-[12px] text-[#71717A]">{receivedFiles.length} files securely received</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-[#71717A] group-hover:text-white flex items-center gap-1 transition-colors mt-2">
                      View all →
                    </span>
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-5">
                  <h3 className="text-[14px] font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={14} className="text-[#71717A]" /> Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {[...sentFiles, ...receivedFiles]
                      .sort((a, b) => new Date(b.shared_at) - new Date(a.shared_at))
                      .slice(0, 5)
                      .map((f, i) => {
                        const isSent = !!f.recipient;
                        return (
                          <div key={`activity-${i}`} className="flex items-center justify-between p-3 bg-[#09090B] rounded-lg border border-[#27272A] hover:border-[#3F3F46] transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${isSent ? "bg-[#27272A]" : "bg-[#27272A]"}`}>
                                {isSent ? <Send size={14} className="text-white" /> : <Inbox size={14} className="text-[#A1A1AA]" />}
                              </div>
                              <div>
                                <h4 className="font-medium text-[13px] text-[#E4E4E7]">{f.file_name}</h4>
                                <p className="text-[11px] text-[#52525B] mt-0.5">
                                  {isSent ? `Shared with ${f.recipient}` : `Received from ${f.sender}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className="text-[11px] text-[#52525B]">{new Date(f.shared_at).toLocaleDateString()}</span>
                              <button onClick={() => downloadFile(f.id, f.file_name)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-white hover:text-[#A1A1AA]">
                                Download
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {sentFiles.length === 0 && receivedFiles.length === 0 && (
                      <p className="text-[13px] text-[#52525B] text-center py-8">No recent activity found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Encode View ═══ */}
            {activeTab === "encode" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Encode & Encrypt</h1>
                  <p className="text-[#71717A] text-[14px]">Convert text or files into layered secure Morse Code format.</p>
                </div>
                
                {/* Language Selector */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-semibold capitalize transition-all whitespace-nowrap ${
                        language === lang
                          ? "bg-white text-[#09090B]"
                          : "bg-[#18181B] text-[#71717A] border border-[#27272A] hover:border-[#3F3F46] hover:text-white"
                      }`}
                    >
                      {lang}
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
                  
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => encodeVoiceText(false)} disabled={!recognizedText || !speechMorse} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-white bg-[#27272A] border border-[#3F3F46] rounded-lg hover:bg-[#3F3F46] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
                      <Download size={14} /> Encode & Download
                    </button>
                    <button onClick={() => encodeVoiceText(true)} disabled={!recognizedText || !speechMorse} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
                      <Send size={14} /> Encode & Share
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* ═══ Decode View ═══ */}
            {activeTab === "decode" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Decode & Decrypt</h1>
                  <p className="text-[#71717A] text-[14px]">Restore your encrypted .enc files back to readable text.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group flex flex-col justify-between">
                    <div>
                      <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2.5">
                        <div className="p-1.5 bg-[#27272A] rounded-md group-hover:bg-white transition-all">
                          <Unlock className="text-white group-hover:text-[#09090B]" size={16} />
                        </div>
                        File Decoding
                      </h2>
                      <div className="border border-dashed border-[#27272A] group-hover:border-[#3F3F46] rounded-xl p-6 mb-4 text-center hover:bg-white/[0.02] transition-all relative cursor-pointer bg-[#09090B]">
                        <input
                          type="file"
                          accept=".enc"
                          onChange={e => setFile(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileBadge className="mx-auto h-8 w-8 text-[#52525B] group-hover:text-white transition-colors mb-2" />
                        <p className="text-[13px] text-[#71717A]">
                          {file ? (
                            <span className="text-white font-medium">{file.name}</span>
                          ) : (
                            <>Drop or <span className="text-white font-medium">browse</span> .enc file</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button onClick={decodeFile} disabled={!file} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all text-[13px] disabled:opacity-30 disabled:cursor-not-allowed btn-lift">
                      <Unlock size={14} /> Decode File
                    </button>
                  </div>

                  {decoded && (
                    <div className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] p-6 rounded-xl transition-all group">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[15px] font-semibold text-white flex items-center gap-2.5">
                          <div className="p-1.5 bg-white rounded-md">
                            <CheckCircle className="text-[#09090B]" size={16} />
                          </div>
                          Decoded Output
                        </h2>
                        <button
                          onClick={shareDecodedText}
                          className="px-4 py-1.5 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] text-[12px] transition-all btn-lift"
                        >
                          Share
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={decoded}
                        className="w-full p-3 rounded-lg bg-[#09090B] text-[#A1A1AA] font-mono border border-[#27272A] h-36 resize-none text-[13px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ Sent Files View ═══ */}
            {activeTab === "sent" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Sent Files</h1>
                  <p className="text-[#71717A] text-[14px]">View and manage the encrypted files you have shared.</p>
                </div>
                
                <div className="space-y-3">
                  {filteredSent.length > 0 ? filteredSent.map(f => (
                    <div key={f.id} className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#27272A] rounded-lg border border-[#3F3F46] group-hover:bg-white group-hover:border-white transition-all shrink-0">
                          <FileText size={18} className="text-white group-hover:text-[#09090B] transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] text-white">{f.file_name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/10 text-white rounded-full">Sent</span>
                            <span className="text-[12px] text-[#71717A]">to</span>
                            <span className="text-[12px] font-medium text-[#A1A1AA]">{f.recipient}</span>
                            <span className="text-[#3F3F46] text-[10px]">•</span>
                            <span className="text-[11px] text-[#52525B] flex items-center gap-1">
                              <Clock size={10} /> {new Date(f.shared_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => downloadFile(f.id, f.file_name)} className="flex items-center gap-2 px-4 py-2 font-semibold text-[12px] text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all btn-lift shrink-0">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  )) : (
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-12 text-center">
                      <Send className="mx-auto h-8 w-8 text-[#3F3F46] mb-3" />
                      <h3 className="text-[15px] font-semibold text-[#71717A]">No sent files</h3>
                      <p className="text-[#52525B] text-[13px] mt-1">Start encoding and sharing files to see them here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ Received Files View ═══ */}
            {activeTab === "received" && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Received Files</h1>
                  <p className="text-[#71717A] text-[14px]">Secure files shared with you by trusted peers.</p>
                </div>
                
                <div className="space-y-3">
                  {filteredReceived.length > 0 ? filteredReceived.map(f => (
                    <div key={f.id} className="bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#27272A] rounded-lg border border-[#3F3F46] group-hover:bg-white group-hover:border-white transition-all shrink-0">
                          <FileBadge size={18} className="text-white group-hover:text-[#09090B] transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] text-white">{f.file_name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[11px] font-semibold px-2 py-0.5 bg-white/10 text-white rounded-full">Received</span>
                            <span className="text-[12px] text-[#71717A]">from</span>
                            <span className="text-[12px] font-medium text-[#A1A1AA]">{f.sender}</span>
                            <span className="text-[#3F3F46] text-[10px]">•</span>
                            <span className="text-[11px] text-[#52525B] flex items-center gap-1">
                              <Clock size={10} /> {new Date(f.shared_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => downloadFile(f.id, f.file_name)} className="flex items-center gap-2 px-4 py-2 font-semibold text-[12px] text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all btn-lift shrink-0">
                        <Download size={14} /> Download
                      </button>
                    </div>
                  )) : (
                    <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-12 text-center">
                      <Inbox className="mx-auto h-8 w-8 text-[#3F3F46] mb-3" />
                      <h3 className="text-[15px] font-semibold text-[#71717A]">No received files</h3>
                      <p className="text-[#52525B] text-[13px] mt-1">Files shared by others will appear here.</p>
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
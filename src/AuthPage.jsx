import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, ShieldAlert, ArrowRight } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function AuthPage({ setToken }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isLogin ? "/login" : "/register";
    const body = isLogin ? { email, password } : { username, email, password };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        } else {
          setMessage(data.message || "Registration successful! Please login.");
          setIsLogin(true);
        }
      } else {
        setMessage(data.error || "Authentication failed");
      }
    } catch (error) {
      setMessage("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F14] text-white relative overflow-hidden font-sans">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FACC15] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-[#111827]/80 backdrop-blur-xl border border-[#1F2937] rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#0B0F14] border border-[#1F2937] rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock className="text-[#FACC15] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400 mt-2 text-sm text-center">
            {isLogin 
              ? "Enter your credentials to access your secure enterprise vault." 
              : "Set up your secure vault to encode and share sensitive payloads."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0B0F14] text-gray-200 border border-[#1F2937] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all placeholder-gray-600"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0B0F14] text-gray-200 border border-[#1F2937] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all placeholder-gray-600"
              required
            />
          </div>
          <div className="relative">
            <ShieldAlert className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0B0F14] text-gray-200 border border-[#1F2937] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FACC15] focus:border-[#FACC15] transition-all placeholder-gray-600"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 font-bold text-black bg-[#FACC15] rounded-xl hover:bg-yellow-400 focus:outline-none transition-all shadow-lg shadow-yellow-500/20 disabled:opacity-70 mt-4"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In to Vault" : "Initialize Account"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
          
          {message && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-sm font-medium text-red-400">{message}</p>
            </div>
          )}
        </form>

        <div className="mt-8 pt-6 border-t border-[#1F2937] text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an enterprise account yet?" : "Already part of the network?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="font-bold text-[#FACC15] hover:text-white transition-colors"
            >
              {isLogin ? "Request Access" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-6 text-gray-600 text-xs font-semibold tracking-widest uppercase">
        Morse Encoder • End-to-End Secure File Transmission 
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, ShieldAlert, ArrowRight, Shield } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090B] text-white relative overflow-hidden font-['Inter',sans-serif]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full opacity-[0.02] blur-[150px]"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full opacity-[0.015] blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-[#18181B]/80 backdrop-blur-xl border border-[#27272A] rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4">
            <Shield className="text-[#09090B] w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[#71717A] mt-2 text-[13px] text-center">
            {isLogin 
              ? "Enter your credentials to access your secure vault." 
              : "Set up your vault to encode and share payloads."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#52525B]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#09090B] text-[#E4E4E7] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3F3F46] focus:border-[#3F3F46] transition-all placeholder-[#52525B] text-[14px]"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#52525B]" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#09090B] text-[#E4E4E7] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3F3F46] focus:border-[#3F3F46] transition-all placeholder-[#52525B] text-[14px]"
              required
            />
          </div>
          <div className="relative">
            <ShieldAlert className="absolute left-3.5 top-3 h-4 w-4 text-[#52525B]" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#09090B] text-[#E4E4E7] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3F3F46] focus:border-[#3F3F46] transition-all placeholder-[#52525B] text-[14px]"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] focus:outline-none transition-all disabled:opacity-50 mt-2 text-[14px] btn-lift"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In to Vault" : "Initialize Account"}
            {!isLoading && <ArrowRight size={16} />}
          </button>
          
          {message && (
            <div className="mt-3 p-3 bg-white/5 border border-[#27272A] rounded-lg text-center">
              <p className="text-[13px] font-medium text-[#A1A1AA]">{message}</p>
            </div>
          )}
        </form>

        <div className="mt-7 pt-5 border-t border-[#27272A] text-center">
          <p className="text-[#71717A] text-[13px]">
            {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setMessage(""); }}
              className="font-semibold text-white hover:text-[#A1A1AA] transition-colors"
            >
              {isLogin ? "Request Access" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[#3F3F46] text-[10px] font-semibold tracking-[2px] uppercase">
        Morse Encoder • Secure File Transmission 
      </div>
    </div>
  );
}

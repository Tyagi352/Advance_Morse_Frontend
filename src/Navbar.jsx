import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { API_BASE } from "./constants";

export default function Navbar({ setToken }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
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

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <nav className="bg-[#09090B] text-white p-4 border-b border-[#27272A]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold hover:text-[#A1A1AA] transition-colors">
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
              <Shield className="text-[#09090B]" size={14} />
            </div>
            Morse Encoder
          </Link>
          <div className="flex items-center gap-2 ml-3 px-3 py-1 bg-[#18181B] rounded-lg border border-[#27272A]">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <span className="text-[13px] text-[#A1A1AA]">{currentUser?.username || "User"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-[14px] text-[#71717A] hover:text-white transition-colors font-medium">Dashboard</Link>
          <Link to="/chat" className="text-[14px] text-[#71717A] hover:text-white transition-colors font-medium flex items-center gap-1">💬 Chat</Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-[13px] font-semibold text-[#09090B] bg-white rounded-lg hover:bg-[#E4E4E7] transition-all flex items-center gap-1.5"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

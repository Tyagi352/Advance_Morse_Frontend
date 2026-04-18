import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ setToken }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <nav className="bg-black text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300">
          Morse Encoder
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-lg hover:text-gray-300 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/chat"
            className="text-lg hover:text-gray-300 transition-colors flex items-center gap-1"
          >
            💬 Chat
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-lg font-bold text-black bg-white rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

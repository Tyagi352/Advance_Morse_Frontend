import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const linkClasses = "block px-4 py-2 text-lg text-gray-700 hover:bg-gray-200 rounded-lg";
  const activeLinkClasses = "bg-black text-white";

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-8">Menu</h2>
      <nav className="space-y-4">
        <NavLink 
          to="/" 
          className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          Encode/Decode
        </NavLink>
        <NavLink 
          to="/sent" 
          className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          Sent Files
        </NavLink>
        <NavLink 
          to="/received" 
          className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
        >
          Received Files
        </NavLink>
      </nav>
    </div>
  );
}

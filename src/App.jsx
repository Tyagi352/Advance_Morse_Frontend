import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import ChatPage from "./ChatPage";

function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  return (
    <Routes>
      <Route path="/"     element={<HomePage />} />
      <Route path="/auth" element={<AuthPage setToken={setToken} />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute token={token}>
            <Dashboard token={token} setToken={setToken} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute token={token}>
            <ChatPage token={token} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

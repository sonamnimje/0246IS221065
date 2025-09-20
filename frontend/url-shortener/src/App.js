import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ShortenerPage from "./pages/ShortnerPage";
import Redirector from "./pages/Redirector";
import LoginPage from "./pages/LoginPage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ShortenerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/go/:shortcode" element={<Redirector />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
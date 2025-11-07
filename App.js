import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DocumentEditor from './pages/DocumentEditor';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowLogin(false);
  };

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  // Show landing page if no user and login not requested
  if (!user && !showLogin) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show login page if no user but login requested
  if (!user && showLogin) {
    return <Login onLogin={handleLogin} onBack={() => setShowLogin(false)} />;
  }

  // Show main app if user is logged in
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
        <Route path="/document/:id" element={<DocumentEditor user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
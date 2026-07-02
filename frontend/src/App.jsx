import React, { useState } from 'react';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  return (
    <>
      {currentPage === 'home' && (
        <Home onNavigate={handleNavigate} isDark={isDark} setIsDark={setIsDark} />
      )}
      {currentPage === 'auth' && (
        <Auth 
          onNavigate={handleNavigate} 
          isDark={isDark} 
          setIsDark={setIsDark} 
          onAuthSuccess={handleAuthSuccess} 
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          onNavigate={handleNavigate} 
          isDark={isDark} 
          user={user} 
        />
      )}
    </>
  );
}
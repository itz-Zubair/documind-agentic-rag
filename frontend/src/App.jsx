import React, { useState, useEffect, lazy, Suspense } from 'react';
import api from './api/axios';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false); // Default to light style to align with user's mockup

  // 1. Persistent Login check on App Mount
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Calls your backend using the protected instance
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
        setCurrentView('dashboard');
      } catch (err) {
        console.error('Session validation failed:', err);
        localStorage.removeItem('authToken'); // Clear broken/expired token
        setCurrentView('home');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // 2. Navigation Guarding Gatekeeper
  const handleNavigate = (view) => {
    const token = localStorage.getItem('authToken');

    // 'auth' is an alias used by Home.jsx — map it to 'login'
    if (view === 'auth') view = 'login';

    // Protect the dashboard view from direct unauthenticated entries
    if (view === 'dashboard' && !token) {
      setCurrentView('login');
      return;
    }

    setCurrentView(view);
  };

  // Simple clean loading fallback while checking token validity
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 font-sans">
        <div className="text-sm font-semibold tracking-wider animate-pulse">
          Validating secure session...
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
          <div className="text-sm font-semibold tracking-wider animate-pulse">
            Loading page resources...
          </div>
        </div>
      }
    >
      {currentView === 'home' && (
        <Home
          isDark={isDark}
          setIsDark={setIsDark}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'login' && (
        <Auth
          isDark={isDark}
          onNavigate={handleNavigate}
          onAuthSuccess={(userData) => {
            setUser(userData);
            setCurrentView('dashboard');
          }}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          user={user}
          isDark={isDark}
          onNavigate={handleNavigate}
          onLogout={() => {
            localStorage.removeItem('authToken');
            setUser(null);
            setCurrentView('home');
          }}
        />
      )}
    </Suspense>
  );
}
import React, { useState } from 'react';
import api from '../api/axios';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth({ onNavigate, isDark , onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/google', {
        idToken: credentialResponse.credential
      });
      const data = response.data;

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (onAuthSuccess) onAuthSuccess(data.user);
      if (onNavigate) onNavigate('dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Google Sign-in failed. Try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-in failed. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (activeTab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login'
      ? { email, password }
      : { name: fullName, email, password };

    try {
      const response = await api.post(endpoint, payload);
      const data = response.data;

      if (activeTab === 'login') {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        if (onAuthSuccess) onAuthSuccess(data.user);
        if (onNavigate) onNavigate('dashboard');
      } else {
        // Registration success workflow
        setSuccess('User registered successfully! Redirecting to login...');
        setTimeout(() => {
          setSuccess('');
          setActiveTab('login');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Authentication failed. Try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }

  };

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
    >
      {/* Background effects */}
      {isDark ? (
        <>
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
        </>
      ) : (
        <>
          <div className="fixed top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50" />
          <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="fixed -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Main centered content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo & branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Agentic RAG
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Enterprise-grade Intelligence with
              <br />
              Retrieval-Augmented Generation.
            </p>
          </div>

          {/* Auth card */}
          <div className={`rounded-2xl border backdrop-blur-sm transition-colors duration-300 ${isDark
            ? 'bg-slate-900/60 border-slate-800/80 shadow-2xl shadow-black/20'
            : 'bg-white border-slate-200 shadow-xl shadow-slate-200/60'
            }`}>
            <div className="p-6 sm:p-8">
              {/* Tab switcher */}
              <div className={`flex rounded-xl p-1 mb-6 ${isDark ? 'bg-slate-950/60' : 'bg-slate-100'}`}>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'login'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'signup'
                    ? isDark
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                      ? 'text-slate-500 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error Banner */}
                {error && (
                  <div className={`p-3 text-xs font-medium rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}>
                    {error}
                  </div>
                )}

                {/* Success Banner */}
                {success && (
                  <div className={`p-3 text-xs font-medium rounded-xl border transition-colors ${
                    isDark 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : 'bg-green-50 border-green-200 text-green-600'
                  }`}>
                    {success}
                  </div>
                )}

                {/* Full name — sign up only */}
                {activeTab === 'signup' && (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Full Name
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        id="auth-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
                          ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                          }`}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
                        ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                        }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password
                    </label>
                    {activeTab === 'login' && (
                      <button type="button" className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
                        ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password — sign up only */}
                {activeTab === 'signup' && (
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <input
                        id="auth-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border outline-none transition-all duration-200 ${isDark
                          ? 'bg-slate-950/60 border-slate-800 text-white placeholder-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20'
                          }`}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 mt-2 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>

                <div className="relative flex py-3 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className={`flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme={isDark ? 'dark' : 'outline'}
                    size="large"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Terms */}
          <p className={`text-center text-xs mt-6 max-w-xs mx-auto leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            By continuing, you agree to Agentic RAG's{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400 underline underline-offset-2 transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400 underline underline-offset-2 transition-colors">Privacy Policy</a>.
          </p>

          {/* Back to home */}
          <div className="text-center mt-5">
            <button
              onClick={() => onNavigate && onNavigate('home')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${isDark
                ? 'text-slate-400 border-slate-800 bg-slate-900/40 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                : 'text-slate-500 border-slate-200 bg-white hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/xl" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`relative z-10 w-full text-center py-6 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
        © 2026 Agentic RAG. All rights reserved.
      </footer>
    </div>
  );
}
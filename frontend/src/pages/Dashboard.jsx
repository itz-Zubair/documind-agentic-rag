import React from 'react';

export default function Dashboard({ onNavigate, isDark, user }) {
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    if (onNavigate) onNavigate('home');
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 px-6 py-4 flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-slate-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
            A
          </div>
          <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Agentic RAG
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Welcome, <strong className="font-semibold">{user?.name || 'User'}</strong>
          </span>
          <button
            onClick={handleLogout}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
              isDark
                ? 'text-white bg-slate-900 border-slate-800 hover:bg-slate-800'
                : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-100 shadow-sm'
            }`}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <header className="space-y-2">
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Workspace Dashboard
          </h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your vectorized documents and run agentic semantic queries.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Vector Index Status</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Active</div>
            <p className="text-xs text-slate-500 mt-2">MongoDB Atlas connection online</p>
          </div>
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-1">Documents Loaded</div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>0</div>
            <p className="text-xs text-slate-500 mt-2">Upload PDFs to embed them</p>
          </div>
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900/40 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-1">Current User Session</div>
            <div className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.email || 'N/A'}
            </div>
            <p className="text-xs text-slate-500 mt-2">Authorized role: member</p>
          </div>
        </div>

        {/* Content Placeholder Box */}
        <div
          className={`rounded-2xl border p-8 text-center space-y-4 ${
            isDark ? 'bg-slate-900/20 border-slate-900' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xl">
            📁
          </div>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Documents Yet</h3>
          <p className={`text-sm max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload files here to build a knowledge index for your AI agent.
          </p>
          <button className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md">
            Upload PDF
          </button>
        </div>
      </main>
    </div>
  );
}

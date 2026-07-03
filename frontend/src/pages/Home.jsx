import React, { useState, useEffect, useRef } from 'react';

export default function Home({ onNavigate, isDark, setIsDark }) {

    const handleStart = () => {
        if (onNavigate) onNavigate('auth');
    };

    // Interactive demo chat state
    const [demoMessages, setDemoMessages] = useState([
        { id: 'init', role: 'bot', text: '👋 Hi there! Try asking me anything about your documents.' }
    ]);
    const [demoInput, setDemoInput] = useState('');
    const [demoTyping, setDemoTyping] = useState(false);
    const [demoLocked, setDemoLocked] = useState(false); // locks after first reply
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [demoMessages, demoTyping]);

    const handleDemoSend = () => {
        const text = demoInput.trim();
        if (!text || demoTyping || demoLocked) return;

        const userMsg = { id: `u-${Date.now()}`, role: 'user', text };
        setDemoMessages(prev => [...prev, userMsg]);
        setDemoInput('');
        setDemoTyping(true);

        setTimeout(() => {
            setDemoTyping(false);
            setDemoMessages(prev => [
                ...prev,
                {
                    id: `b-${Date.now()}`,
                    role: 'bot',
                    text: '🔐 Welcome! Please sign in or register first to start chatting with your documents.',
                    cta: true
                }
            ]);
            setDemoLocked(true); // lock after one exchange
        }, 1200);
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
            }`}>

            {/* 1. NAVIGATION BAR */}
            <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 px-6 py-4 flex items-center justify-between ${isDark ? 'bg-slate-950/80 border-slate-900' : 'bg-white/80 border-slate-200'
                }`}>
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md">
                        A
                    </div>
                    <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                        Agentic RAG
                    </span>
                </div>

                <div className={`hidden md:flex items-center space-x-8 text-sm font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    <a href="#features" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-blue-600'}`}>Features</a>
                    <a href="#how-it-works" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-blue-600'}`}>How It Works</a>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className={`p-2 rounded-xl border transition-all ${isDark
                                ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
                            }`}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.343l.707-.707m2.828 9.9a5 5 0 117.072 0l-7.072 7.072z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={handleStart}
                        className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm border ${isDark
                                ? 'text-white bg-slate-900 border-slate-800 hover:bg-slate-800'
                                : 'text-slate-700 bg-white border-slate-200 hover:bg-slate-100'
                            }`}
                    >
                        Launch App
                    </button>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-600'
                        }`}>
                        ⚡ Next-Gen Retrieval
                    </div>
                    <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                        Your Documents, Powered by <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">Agentic Intelligence</span>
                    </h1>
                    <p className={`text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                        Go beyond simple keyword matching. Our agentic system autonomously parses, reasons, and synthesizes complex document insights with ultimate speed and context processing.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={handleStart}
                            className="px-6 py-3.5 text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Get Started for Free
                        </button>
                    </div>
                </div>

                {/* Interactive Demo Chat */}
                <div className="lg:col-span-6 relative">
                    <div className={`absolute -inset-1 rounded-2xl opacity-20 blur-xl ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}></div>
                    <div className={`relative border rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`} style={{ height: '380px' }}>

                        {/* Title bar */}
                        <div className={`flex items-center justify-between border-b px-4 py-3 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex space-x-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
                            </div>
                            <div className={`px-3 py-0.5 rounded-md text-[11px] font-mono ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                agentic-workspace/demo
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live Demo</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {demoMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'bot' && (
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 shadow-sm mt-0.5">
                                            A
                                        </div>
                                    )}
                                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed font-sans ${
                                        msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                                            : isDark
                                                ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                                                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm shadow-sm'
                                    }`}>
                                        <p>{msg.text}</p>
                                        {msg.cta && (
                                            <button
                                                onClick={handleStart}
                                                className="mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                            >
                                                Sign In / Register →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {demoTyping && (
                                <div className="flex justify-start">
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 shadow-sm mt-0.5">
                                        A
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100 shadow-sm'}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className={`border-t px-3 py-3 shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            {demoLocked ? (
                                <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🔒</span>
                                        <span className={`text-[12px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Demo limit reached</span>
                                    </div>
                                    <button
                                        onClick={handleStart}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                    >
                                        Sign In →
                                    </button>
                                </div>
                            ) : (
                                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <input
                                        type="text"
                                        value={demoInput}
                                        onChange={e => setDemoInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleDemoSend()}
                                        placeholder="Ask about your documents..."
                                        className={`flex-1 text-[13px] bg-transparent border-none outline-none ${isDark ? 'text-slate-300 placeholder-slate-600' : 'text-slate-700 placeholder-slate-400'}`}
                                    />
                                    <button
                                        onClick={handleDemoSend}
                                        disabled={!demoInput.trim() || demoTyping}
                                        className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shadow-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <p className={`text-center text-[10px] mt-1.5 font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                {demoLocked ? 'Sign in to unlock full access' : 'Press Enter to send · Demo Mode'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 3. CORE FEATURES GRID */}
            <section id="features" className={`max-w-7xl mx-auto px-6 py-20 border-t scroll-mt-20 ${isDark ? 'border-slate-900' : 'border-slate-200'
                }`}>
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Precision Engineering for Modern RAG
                    </h2>
                    <div className="h-1 w-16 bg-blue-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className={`border p-8 rounded-2xl transition-all hover:scale-[1.01] ${isDark ? 'bg-slate-900/40 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}>
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold mb-5">
                            🗚
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Page-Aware Parsing</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Maintains full structural integrity across variable grid columns, layout parameters, and tables automatically.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className={`border p-8 rounded-2xl transition-all hover:scale-[1.01] ${isDark ? 'bg-slate-900/40 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}>
                        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold mb-5">
                            💬
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Stateful Chat</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Retains complete conversational memory tracking across continuous back-and-forth query cycles.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className={`border p-8 rounded-2xl transition-all hover:scale-[1.01] ${isDark ? 'bg-slate-900/40 border-slate-900 hover:border-slate-800' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}>
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold mb-5">
                            🌐
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>High-Dimensional Indexing</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Powered directly by MongoDB Atlas vector matrices for rapid semantic clustering and contextual data retrieval.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. "HOW IT WORKS" TIMELINE SECTION */}
            <section id="how-it-works" className={`max-w-7xl mx-auto px-6 py-20 border-t scroll-mt-20 ${isDark ? 'border-slate-900' : 'border-slate-200'
                }`}>
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Intelligence in Three Simple Steps
                    </h2>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Zero configuration required to start auditing files.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Step 1 */}
                    <div className="space-y-3 text-center lg:text-left">
                        <div className={`mx-auto lg:mx-0 h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isDark ? 'bg-slate-900 border-blue-500 text-blue-400' : 'bg-white border-blue-600 text-blue-600 shadow-sm'
                            }`}>
                            1
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Upload</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Drop any standard PDF document file up to 10MB cleanly into your personal dashboard container setup.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3 text-center lg:text-left">
                        <div className={`mx-auto lg:mx-0 h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isDark ? 'bg-slate-900 border-indigo-500 text-indigo-400' : 'bg-white border-indigo-600 text-indigo-600 shadow-sm'
                            }`}>
                            2
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Vectorize</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            The tracking pipeline partitions layout indexes automatically and maps them into embedding clusters.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-3 text-center lg:text-left">
                        <div className={`mx-auto lg:mx-0 h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${isDark ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-white border-emerald-600 text-emerald-600 shadow-sm'
                            }`}>
                            3
                        </div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Query</h3>
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Submit natural language questions and review grounded insights synthesized with deep generative context accuracy.
                        </p>
                    </div>
                </div>
            </section>

            {/* 5. BOTTOM WORKSPACE ACTION BANNER */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className={`rounded-2xl p-10 text-center space-y-6 border ${isDark
                        ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-900'
                        : 'bg-gradient-to-b from-slate-100 to-slate-50 border-slate-200 shadow-sm'
                    }`}>
                    <h2 className={`text-2xl sm:text-3xl font-extrabold max-w-xl mx-auto tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                        Ready to unlock the hidden knowledge inside your documents?
                    </h2>
                    <div className="pt-2">
                        <button
                            onClick={handleStart}
                            className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-95"
                        >
                            Open Your Workspace
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. CLEAN FOOTER */}
            <footer className={`max-w-7xl mx-auto px-6 py-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs ${isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-400'
                }`}>
                <div>
                    Agentic RAG &copy; 2026. All rights reserved.
                </div>
                <div className="flex space-x-6">
                    <a href="#" className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>Privacy Policy</a>
                    <a href="#" className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>Terms of Service</a>
                    <a href="#" className={`transition-colors ${isDark ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>Documentation</a>
                </div>
            </footer>

        </div>
    );
}
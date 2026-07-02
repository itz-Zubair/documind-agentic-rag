import React, { useState } from 'react';

export default function Home({ onNavigate, isDark, setIsDark }) {

    const handleStart = () => {
        if (onNavigate) onNavigate('auth');
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

                {/* Workspace Visual Representation Area */}
                <div className="lg:col-span-6 relative">
                    <div className={`absolute -inset-1 rounded-2xl opacity-20 blur-xl ${isDark ? 'bg-blue-500' : 'bg-blue-300'}`}></div>
                    <div className={`relative border rounded-2xl shadow-xl overflow-hidden aspect-[4/3] p-4 flex flex-col justify-between transition-colors ${isDark ? 'border-slate-900 bg-slate-900/90' : 'border-slate-200 bg-white'
                        }`}>
                        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                            </div>
                            <div className={`px-3 py-0.5 rounded-md text-[11px] font-mono ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
                                agentic-workspace/rag-ui
                            </div>
                            <div className="w-4"></div>
                        </div>

                        <div className="flex-1 py-4 space-y-4 font-mono text-xs overflow-hidden">
                            <div className={`p-3 rounded-xl border max-w-[80%] ${isDark ? 'bg-slate-950/60 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'
                                }`}>
                                📄 Loaded: document_analysis.pdf
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl max-w-[80%] ml-auto text-blue-500 text-right">
                                Analyze data trends in the summary segment.
                            </div>
                            <div className={`p-3 rounded-xl border max-w-[85%] ${isDark ? 'bg-slate-950/60 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                                }`}>
                                🤖 <span className="text-blue-500 font-bold">Agent:</span> Extracted context vectors confirm sharp system performance jumps inside localized parameters...
                            </div>
                        </div>

                        <div className={`border-t pt-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                            <div className={`border rounded-xl p-2.5 flex items-center justify-between text-xs ${isDark ? 'bg-slate-950 border-slate-850 text-slate-600' : 'bg-slate-50 border-slate-150 text-slate-400'
                                }`}>
                                <span>Ask about your documents...</span>
                                <span className="text-blue-500 font-bold">➔</span>
                            </div>
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
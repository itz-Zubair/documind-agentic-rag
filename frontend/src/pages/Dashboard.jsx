import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios'; // Import the protected Axios instance built in Step 1

export default function Dashboard({ user, onLogout }) {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // 1. Initial Load: Fetch all documents from backend
  const fetchFiles = async (shouldSelectFirst = false) => {
    try {
      const response = await api.get('/api/documents');
      const mappedFiles = (response.data.documents || []).map(d => ({
        id: d._id,
        name: d.originalName,
        status: d.status,
        pageCount: d.pageCount || 0
      }));
      setFiles(mappedFiles);
      
      if (shouldSelectFirst && mappedFiles.length > 0 && !activeFileId) {
        setActiveFileId(mappedFiles[0].id);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  useEffect(() => {
    fetchFiles(true);
  }, []);

  // 2. Active Documents Polling: Check status automatically if a file is embedding
  useEffect(() => {
    const hasProcessingFiles = files.some(f => f.status === 'processing' || f.status === 'indexing');
    if (!hasProcessingFiles) return;

    const interval = setInterval(() => {
      fetchFiles();
    }, 4000); // Poll status every 4 seconds until vectorization completes

    return () => clearInterval(interval);
  }, [files]);

  // 3. Dynamic Chat Fetching: Load history whenever selection targets change
  useEffect(() => {
    if (!activeFileId) {
      setMessages([]);
      return;
    }

    const fetchChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await api.get('/api/documents/history');
        const mappedMessages = (response.data.history || []).map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        if (mappedMessages.length === 0 && activeFile) {
          setMessages([
            {
              id: 'greeting',
              role: 'model',
              content: `Hello! I've indexed **${activeFile.name}**. I can help you summarize the key findings or answer specific technical questions regarding the methodology.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: ['Summarize Intro', 'List Requirements']
            }
          ]);
        } else {
          setMessages(mappedMessages);
        }
      } catch (err) {
        console.error('Failed to read conversation history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [activeFileId]);

  // Auto-scroll anchor adjustment
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const activeFile = files.find(f => f.id === activeFileId) || null;

  // 4. API Action: Process File Uploads via Multipart FormData
  const handleFileUpload = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are supported!');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      setIsThinking(true);
      const response = await api.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const doc = response.data.document;
      const newFile = {
        id: doc._id,
        name: doc.originalName,
        status: doc.status,
        pageCount: doc.pageCount || 0
      };
      setFiles(prev => [newFile, ...prev]);
      setActiveFileId(newFile.id);
    } catch (err) {
      console.error('File upload system fault:', err);
      if (err.response?.status === 429) {
        setShowLimitWarning(true);
      } else {
        alert(err.response?.data?.message || 'Upload dropped due to server limits.');
      }
    } finally {
      setIsThinking(false);
    }
  };

  // 5. API Action: Post Queries directly to the RAG Agent Engine
  const handleSendQuery = async (textToSend) => {
    if (!textToSend.trim() || !activeFileId || isThinking) return;

    const userMsg = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQueryText('');
    setIsThinking(true);

    try {
      const response = await api.post('/api/documents/query', { question: textToSend });
      const aiMsg = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        content: response.data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), userMsg, aiMsg]);
    } catch (err) {
      console.error('RAG Pipeline Engine response fault:', err);
      if (err.response?.status === 429) {
        setShowLimitWarning(true);
        // Remove the optimistically added user message since the query was blocked
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      }
    } finally {
      setIsThinking(false);
    }
  };

  // 6. API Action: Clear Chat Logs Context data
  const handleClearHistory = async () => {
    try {
      await api.delete('/api/documents/clear-history');
      setMessages([
        {
          id: `sys-clear-${Date.now()}`,
          role: 'model',
          content: `Chat context has been wiped clean. What points should we retrieve from **${activeFile?.name || 'document'}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: ['Summarize Document', 'Quick Overview']
        }
      ]);
    } catch (err) {
      console.error('Wipe request refused:', err);
    }
  };

  // 7. API Action: Purge Vector Store Index Context data 
  const handleDeleteFile = async (e, fileId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document and remove its indexed embedding spaces?')) return;

    try {
      await api.delete(`/api/documents/${fileId}`);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      if (activeFileId === fileId) {
        const remaining = files.filter(f => f.id !== fileId);
        setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (err) {
      console.error('Failed to isolate file termination sequence:', err);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col overflow-y-auto flex-1">
          <div className="p-6 border-b border-[#F1F5F9] flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Agentic RAG</h1>
              <p className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">ENTERPRISE ASSISTANT</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-[#F1F5F9] rounded-lg md:hidden border-0 bg-transparent cursor-pointer transition-colors"
              aria-label="Close sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-4">
            <button
              onClick={() => handleSendQuery('Start a fresh workspace conversation context')}
              disabled={!activeFileId}
              className="w-full py-2.5 px-4 bg-[#0A56E4] hover:bg-[#0848C0] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border-0 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          <div className="px-3 space-y-1">
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg bg-[#0A56E4] text-white text-left border-0 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload PDF
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#F1F5F9] rounded-lg text-left border-0 bg-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>Your Files
            </button>
            <button onClick={handleClearHistory} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#F1F5F9] rounded-lg text-left border-0 bg-transparent cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>Clear History
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-[#F1F5F9] rounded-lg text-left border-0 bg-transparent cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>Logout
            </button>
          </div>

          <div className="px-4 mt-6">
            <div onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#CBD5E1] hover:border-[#0A56E4] bg-[#F8FAFC] hover:bg-[#F0F5FF] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs font-semibold text-slate-600">Drag & Drop PDF</span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">LIMIT: 1 PDF / 24H</span>
              <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} accept=".pdf" className="hidden" />
            </div>
          </div>

          <div className="mt-8 px-4 flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">YOUR FILES</p>
            <div className="space-y-1.5 pb-6">
              {files.map(file => (
                <div key={file.id} onClick={() => setActiveFileId(file.id)} className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${activeFileId === file.id ? 'bg-[#EBF2FE] border-[#C2DBFE] text-[#0A56E4]' : 'bg-white border-[#F1F5F9] hover:bg-[#F8FAFC] text-slate-700'}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-normal">{file.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${file.status === 'ready' ? 'bg-[#3B82F6]' : 'bg-[#64748B] animate-pulse'}`} />
                        <span className="text-[9px] font-semibold text-slate-400 uppercase leading-none">{file.status}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteFile(e, file.id)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors border-0 bg-transparent cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#F1F5F9] flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1E293B] flex items-center justify-center text-white text-xs font-bold select-none overflow-hidden shrink-0 border border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-400 translate-y-1">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate leading-none">{user?.name || 'Alex Chen'}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-none">{user?.email || 'alex@enterprise.ai'}</p>
          </div>
        </div>
      </div>

      {/* CHAT VIEW WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="h-14 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Hamburger Button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-[#F1F5F9] rounded-lg md:hidden border-0 bg-transparent cursor-pointer transition-colors"
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {activeFile ? (
              <div className="flex items-center gap-2 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#EF4444] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-bold text-slate-800 truncate">{activeFile.name}</span>
                <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs font-medium text-slate-500 hidden sm:inline">{activeFile.pageCount || '0'} Pages</span>
                <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EBF2FE] text-[#0A56E4] uppercase tracking-wide shrink-0">{activeFile.status}</span>
              </div>
            ) : (
              <span className="text-sm font-bold text-slate-500 truncate">No active document</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" />
            <span className="text-xs font-semibold text-slate-500 hidden xs:inline">Workspace Sync Online</span>
          </div>
        </div>

        {showLimitWarning && (
          <div className="absolute top-18 right-6 w-96 bg-[#FFE4E6] border border-[#FECDD3] rounded-xl p-4 flex items-start gap-3 shadow-md z-20 animate-slide-in">
            <div className="p-1 rounded bg-red-100 text-[#EF4444] shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-[#991B1B]">Daily limit reached!</h3>
              <p className="text-[11px] font-medium text-[#B91C1C] mt-0.5 leading-normal">You are allowed 1 PDF upload and 3 queries every 24 hours.</p>
            </div>
            <button onClick={() => setShowLimitWarning(false)} className="text-[#CD2C2C] hover:bg-red-200/50 p-1 rounded-lg shrink-0 cursor-pointer border-0 bg-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC] space-y-6">
          {activeFileId ? (
            <>
              {isLoadingHistory ? (
                <div className="text-center text-xs font-medium text-slate-400 py-12 animate-pulse">Syncing chat ledger context...</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 sm:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                      <div className="h-8 w-8 rounded-full bg-[#0A56E4] flex items-center justify-center text-white shrink-0 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
                      <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#0A56E4] text-white rounded-tr-sm shadow-sm' : 'bg-white text-slate-800 border border-[#E2E8F0] rounded-tl-sm shadow-sm'}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.suggestions?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {msg.suggestions.map((suggestion, idx) => (
                            <button key={idx} onClick={() => handleSendQuery(suggestion)} className="px-3 py-1.5 bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] hover:border-[#94A3B8] text-xs font-semibold text-slate-600 rounded-lg transition-all cursor-pointer shadow-sm">{suggestion}</button>
                          ))}
                        </div>
                      )}
                      <span className={`text-[10px] font-semibold text-slate-400 mt-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</span>
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0 shadow-sm text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))
              )}
 
              {isThinking && (
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <div className="h-8 w-8 rounded-full bg-[#0A56E4] flex items-center justify-center text-white shrink-0 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="p-3.5 rounded-2xl bg-[#EBF2FE] text-[#0A56E4] border border-[#C2DBFE] rounded-tl-sm shadow-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A56E4] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A56E4] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A56E4] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[13px] font-semibold">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-600">No Documents Uploaded</h3>
              <p className="text-xs max-w-xs mt-1">Upload a PDF in the sidebar to start a Retrieval-Augmented Generation chat session.</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
 
        <div className="p-4 border-t border-[#E2E8F0] bg-white shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSendQuery(queryText); }} className="flex items-center gap-3 max-w-4xl mx-auto relative bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0] px-4 py-2">
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                showLimitWarning
                  ? 'Daily query limit reached. Please try again later.'
                  : activeFile && activeFile.status === 'ready'
                  ? 'Write a question...'
                  : 'Please wait for file vectorization...'
              }
              disabled={!activeFile || activeFile.status !== 'ready' || isThinking || showLimitWarning}
              className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder-slate-400 py-1.5 pr-12 sm:pr-28 text-slate-800 disabled:opacity-50"
            />
            <div className="absolute right-4 flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline select-none">Shift + Enter for new line</span>
              <button type="submit" disabled={!queryText.trim() || !activeFile || activeFile.status !== 'ready' || isThinking || showLimitWarning} className="h-8 w-8 rounded-lg bg-[#0A56E4] hover:bg-[#0848C0] text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm border-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
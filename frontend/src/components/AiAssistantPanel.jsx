import React, { useState, useEffect, useRef } from 'react';
import { 
    Send, Bot, User, Sparkles, Trash2, Brain, Zap, Clock, 
    MessageSquare, Target, Layers, BarChart4, Activity, X, 
    Maximize2, Minimize2, ChevronRight, Wand2, Lightbulb, FileSearch
} from 'lucide-react';
import { aiChat, summarizeText } from '../services/api';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const AiAssistantPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('study_assistant_history');
        return saved ? JSON.parse(saved) : [
            { id: '1', role: 'assistant', text: "I'm your AI Study Assistant! I can help you with your subjects, plan your day, or even summarize the current page. How can I assist?", timestamp: new Date() }
        ];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'analyze', 'actions'
    const [pageSummary, setPageSummary] = useState('');
    const messagesEndRef = useRef(null);
    const location = useLocation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        localStorage.setItem('study_assistant_history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    // Reset some states on page change
    useEffect(() => {
        setPageSummary('');
        if (isOpen && activeTab === 'analyze') {
             // Maybe auto-analyze? No, let user trigger it to save tokens/stay user-friendly
        }
    }, [location.pathname]);

    const handleSend = async (val = input, contextOverride = null) => {
        const text = val.trim();
        if (!text || loading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            let context = messages.slice(-5).map(m => `${m.role === 'user' ? 'Student' : 'Assistant'}: ${m.text}`).join('\n');
            if (contextOverride) context += `\n\nPage Context:\n${contextOverride}`;
            
            const res = await aiChat({ message: text, context });
            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: res.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            toast.error("Connection lost to my central brain.");
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                text: "I'm having trouble connecting right now, but remember: consistency is the key to mastering any subject!",
                timestamp: new Date()
            }]);
        }
        setLoading(false);
    };

    const analyzePage = async () => {
        setLoading(true);
        setActiveTab('analyze');
        try {
            // Grab visible text from main content
            const mainContent = document.querySelector('main')?.innerText || document.body.innerText;
            const textToAnalyze = mainContent.substring(0, 4000); // Limit context
            
            const res = await summarizeText({ text: textToAnalyze });
            setPageSummary(res.data.summary);
            toast.success("Page analyzed!");
        } catch (error) {
            toast.error("Failed to analyze page content.");
        }
        setLoading(false);
    };

    const askAboutPage = () => {
        const mainContent = document.querySelector('main')?.innerText || "";
        const context = mainContent.substring(0, 2000);
        handleSend(`Based on this page, what should I focus on?`, context);
        setActiveTab('chat');
    };

    const clearChat = () => {
        setMessages([{ id: '1', role: 'assistant', text: "Chat history cleared. How can I help you now?", timestamp: new Date() }]);
        localStorage.removeItem('study_assistant_history');
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="ai-toggle-btn"
                    style={{
                        position: 'fixed', bottom: '2rem', right: '2rem',
                        width: '60px', height: '60px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)', border: 'none', cursor: 'pointer',
                        zIndex: 1000, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'pulse-slow 3s infinite'
                    }}
                >
                    <Bot size={28} />
                    <div style={{ position: 'absolute', top: -5, right: -5, width: 12, height: 12, background: '#10b981', borderRadius: '50%', border: '2px solid #080812' }} />
                </button>
            )}

            {/* Side Panel */}
            <div 
                className={`ai-panel ${isOpen ? 'open' : ''}`}
                style={{
                    position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh',
                    background: 'rgba(10, 10, 25, 0.95)', backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                    zIndex: 1001, transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', padding: '0.5rem', borderRadius: '10px' }}>
                            <Bot size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0 }}>AI Assistant</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%' }} />
                                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Context Aware</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', gap: '0.5rem' }}>
                    {[
                        { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
                        { id: 'analyze', icon: <FileSearch size={16} />, label: 'Analyze Page' },
                        { id: 'actions', icon: <Zap size={16} />, label: 'Quick Tools' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '0.6rem', borderRadius: '8px', border: '1px solid transparent',
                                background: activeTab === tab.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                                color: activeTab === tab.id ? '#818cf8' : '#64748b',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                borderColor: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent'
                            }}
                        >
                            {tab.icon} {!isOpen ? '' : tab.label.split(' ')[0]}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="custom-scrollbar">
                    {activeTab === 'chat' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
                                        background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {msg.role === 'user' ? <User size={14} color="#818cf8" /> : <Bot size={14} color="#10b981" />}
                                    </div>
                                    <div style={{
                                        maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '14px',
                                        background: msg.role === 'user' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ width: 28, height: 28, background: 'rgba(16,185,129,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bot size={14} color="#10b981" />
                                    </div>
                                    <div className="typing-indicator" style={{ display: 'flex', gap: 4, padding: '0.75rem' }}>
                                        <div className="dot" /> <div className="dot" /> <div className="dot" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {activeTab === 'analyze' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                                <FileSearch size={32} color="#818cf8" style={{ marginBottom: '1rem' }} />
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Smart Page Scanner</h4>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 1.25rem 0' }}>
                                    I will read the content of <strong>{location.pathname.replace('/', '') || 'Dashboard'}</strong> and provide key takeaways.
                                </p>
                                <button 
                                    onClick={analyzePage} 
                                    className="btn-primary" 
                                    disabled={loading}
                                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.8rem', borderRadius: '8px' }}
                                >
                                    {loading ? 'Analyzing...' : 'Scan Current Page'}
                                </button>
                            </div>

                            {pageSummary && (
                                <div className="fade-in" style={{ padding: '1rem', background: 'rgba(99,102,241,0.05)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.1)' }}>
                                    <p style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 800, textTransform: 'uppercase', marginBottom:8 }}>AI Summary</p>
                                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {pageSummary}
                                    </div>
                                    <button 
                                        onClick={askAboutPage}
                                        style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                        Ask me follow-up questions
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {[
                                { label: 'Flashcards', desc: 'Create from page', icon: <Brain size={20} />, action: () => handleSend("Generate flashcards from the current page content.") },
                                { label: 'Plan Goal', desc: 'Break down tasks', icon: <Target size={20} />, action: () => handleSend("Help me break down a new study goal.") },
                                { label: 'Motivation', desc: 'Quick pep talk', icon: <Zap size={20} />, action: () => handleSend("Give me some motivation to study!") },
                                { label: 'Summarize', desc: 'Quick overview', icon: <Layers size={20} />, action: analyzePage },
                            ].map((tools, i) => (
                                <button 
                                    key={i} 
                                    onClick={tools.action}
                                    style={{ 
                                        padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
                                        borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    <div style={{ color: '#818cf8', marginBottom: 8 }}>{tools.icon}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{tools.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{tools.desc}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input */}
                <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ position: 'relative' }}>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.8rem 1rem', paddingRight: '3rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', fontSize: '0.85rem', outline: 'none'
                            }}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !input.trim()}
                            style={{ 
                                position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                                width: '32px', height: '32px', borderRadius: '8px', color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                        <button onClick={clearChat} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, margin: '0 auto' }}>
                           <Trash2 size={10} /> Clear Chat History
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse-slow {
                    0% { transform: scale(1); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                    50% { transform: scale(1.05); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
                }
                .ai-panel.open { transform: translateX(0); }
                .typing-indicator .dot { width: 4px; height: 4px; background: #94a3b8; borderRadius: 50%; animation: bounce 1.4s infinite ease-in-out; }
                .typing-indicator .dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-indicator .dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }
                
                @media (max-width: 600px) {
                    .ai-panel { width: 100% !important; }
                }
            `}</style>
        </>
    );
};

export default AiAssistantPanel;

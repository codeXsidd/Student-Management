import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageSquare } from 'lucide-react';
import API from '../services/api';

const FloatingAiBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userQ = query.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: userQ }]);
        setQuery('');
        setLoading(true);

        try {
            const res = await API.post('/ai/ask-about-me', { query: userQ });
            setChatHistory(prev => [...prev, { role: 'ai', content: res.data.reply }]);
        } catch {
            setChatHistory(prev => [...prev, { role: 'ai', content: "I'm having trouble accessing your workspace data. Please check your connection." }]);
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            {isOpen && (
                <div className="glass-card animate-slide-up" style={{
                    width: '350px', height: '480px', borderRadius: '24px', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid rgba(99,102,241,0.2)',
                    background: 'rgba(10, 10, 25, 0.9)', backdropFilter: 'blur(20px)'
                }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="ai-pulse-bg" style={{ 
                                width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center' 
                            }}>
                                <Bot size={18} color="white" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Workspace Advisor</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>AI CONNECTED</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="custom-scrollbar">
                        {chatHistory.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', opacity: 0.6 }}>
                                <Sparkles size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '0.85rem' }}>Ask me about your assignments, study plans, or current focus!</p>
                            </div>
                        )}
                        {chatHistory.map((chat, idx) => (
                            <div key={idx} style={{ 
                                alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '16px',
                                background: chat.role === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: chat.role === 'user' ? 'white' : '#e2e8f0',
                                fontSize: '0.82rem', lineHeight: 1.5,
                                borderBottomRightRadius: chat.role === 'user' ? '4px' : '16px',
                                borderBottomLeftRadius: chat.role === 'ai' ? '4px' : '16px'
                            }}>
                                {chat.content}
                            </div>
                        ))}
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', borderBottomLeftRadius: '4px' }}>
                                <div className="spinner-small" />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleAsk} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '0.5rem' }}>
                        <input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="How many assignments are left?"
                            style={{ 
                                flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px', padding: '0.6rem 0.8rem', color: 'white', fontSize: '0.82rem', outline: 'none'
                            }}
                        />
                        <button type="submit" style={{ 
                            width: 38, height: 38, borderRadius: '10px', background: 'var(--primary)', 
                            border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="ai-icon-pulse"
                style={{ 
                    width: 60, height: 60, borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #10b981)',
                    border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.4)', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>
        </div>
    );
};

export default FloatingAiBot;

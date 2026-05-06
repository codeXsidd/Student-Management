import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    Bot, Bug, Code, Sparkles, Terminal, ShieldCheck, 
    Send, User, Cpu, Zap, Info, ChevronRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { welcomeAgent, issueResolver, prReviewer, getMe } from '../services/api';
import Editor from '@monaco-editor/react';

const AgentDevHubPage = () => {
    const [activeAgent, setActiveAgent] = useState('welcome');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    
    // Welcome Agent State
    const [welcomeMsg, setWelcomeMsg] = useState('');
    
    // Issue Resolver State
    const [issue, setIssue] = useState('');
    const [issueCode, setIssueCode] = useState('// Paste your buggy code here...');
    const [issueResult, setIssueResult] = useState('');
    
    // PR Reviewer State
    const [prCode, setPrCode] = useState('// Paste your code changes here...');
    const [prContext, setPrContext] = useState('');
    const [prResult, setPrResult] = useState('');

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await getMe();
            setUser(res.data);
            handleWelcome(res.data.name);
        } catch (error) {
            console.error(error);
        }
    };

    const handleWelcome = async (name) => {
        setLoading(true);
        try {
            const res = await welcomeAgent({ name });
            setWelcomeMsg(res.data.message);
        } catch (error) {
            toast.error("Welcome Agent is sleeping...");
        } finally {
            setLoading(false);
        }
    };

    const handleIssueResolve = async () => {
        if (!issue.trim()) return toast.error("Describe the issue first!");
        setLoading(true);
        try {
            const res = await issueResolver({ issue, code: issueCode });
            setIssueResult(res.data.analysis);
            toast.success("Diagnosis complete!");
        } catch (error) {
            toast.error("Failed to resolve issue.");
        } finally {
            setLoading(false);
        }
    };

    const handlePRReview = async () => {
        if (!prCode.trim() || prCode.includes('Paste your code')) return toast.error("Provide some code to review!");
        setLoading(true);
        try {
            const res = await prReviewer({ code: prCode, context: prContext });
            setPrResult(res.data.review);
            toast.success("Review complete!");
        } catch (error) {
            toast.error("Failed to review code.");
        } finally {
            setLoading(false);
        }
    };

    const agents = [
        { id: 'welcome', name: 'Welcome Bot', icon: <Bot size={20} />, color: '#6366f1', description: 'Your personal guide to the DevHub.' },
        { id: 'resolver', name: 'Issue Resolver', icon: <Bug size={20} />, color: '#f87171', description: 'Expert debugging and troubleshooting.' },
        { id: 'reviewer', name: 'PR Reviewer', icon: <ShieldCheck size={20} />, color: '#34d399', description: 'Professional code review and quality check.' }
    ];

    return (
        <div className="page-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' }}>
            <Helmet>
                <title>Agentic DevHub | StudyTrack</title>
            </Helmet>

            <header style={{ marginBottom: '2rem' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '0.75rem', borderRadius: '15px', color: 'white' }}>
                        <Cpu size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Agentic DevHub
                        </h1>
                        <p style={{ color: '#94a3b8', margin: 0 }}>Supercharge your development with specialized AI agents.</p>
                    </div>
                </motion.div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                {/* Agent Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {agents.map(agent => (
                        <motion.button
                            key={agent.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveAgent(agent.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                                background: activeAgent === agent.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: activeAgent === agent.id ? agent.color : 'rgba(255,255,255,0.05)',
                                borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s'
                            }}
                        >
                            <div style={{ color: agent.color }}>{agent.icon}</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: activeAgent === agent.id ? '#fff' : '#cbd5e1' }}>{agent.name}</h3>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{agent.description}</p>
                            </div>
                        </motion.button>
                    ))}

                    <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '20px', border: '1px dashed rgba(99, 102, 241, 0.2)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={14} /> Agent Power
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
                            These agents use Gemini 2.0 Flash to provide near-instant technical guidance.
                        </p>
                    </div>
                </aside>

                {/* Agent Workspace */}
                <main className="glass-card" style={{ padding: '2rem', minHeight: '600px', display: 'flex', flexDirection: 'column', background: 'rgba(10, 10, 20, 0.4)' }}>
                    <AnimatePresence mode="wait">
                        {activeAgent === 'welcome' && (
                            <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', border: '2px solid rgba(99, 102, 241, 0.2)' }}>
                                    <Bot size={48} color="#6366f1" />
                                </div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Welcome to the Hub, {user?.name || 'Student'}!</h2>
                                <div style={{ maxWidth: '600px', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    {loading ? (
                                        <div className="animate-pulse" style={{ color: '#94a3b8' }}>Agent is preparing your workspace...</div>
                                    ) : (
                                        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: 1.8, margin: 0 }}>
                                            {welcomeMsg || "I'm your DevHub assistant. Choose an agent from the left to start debugging issues or reviewing your pull requests."}
                                        </p>
                                    )}
                                </div>
                                <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', width: '100%', maxWidth: '600px' }}>
                                    <div className="stat-card">
                                        <h4 style={{ color: '#f87171' }}><Bug size={16} /> Debug Issues</h4>
                                        <p>Get instant fixes for your coding bugs.</p>
                                    </div>
                                    <div className="stat-card">
                                        <h4 style={{ color: '#34d399' }}><ShieldCheck size={16} /> Review Code</h4>
                                        <p>Ensure your PRs meet industry standards.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeAgent === 'resolver' && (
                            <motion.div key="resolver" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Bug color="#f87171" /> Issue Resolver
                                    </h2>
                                    <button onClick={handleIssueResolve} disabled={loading} className="agent-btn resolver">
                                        {loading ? <Zap className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                        {loading ? 'Analyzing...' : 'Resolve Issue'}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ flex: '0 0 auto' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Problem Description</label>
                                            <textarea 
                                                value={issue}
                                                onChange={(e) => setIssue(e.target.value)}
                                                placeholder="Describe the bug or issue you're facing..."
                                                style={{ width: '100%', height: '100px', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Code Context</label>
                                            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Editor
                                                    height="100%"
                                                    language="javascript"
                                                    theme="vs-dark"
                                                    value={issueCode}
                                                    onChange={(v) => setIssueCode(v)}
                                                    options={{ minimap: { enabled: false }, fontSize: 13 }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="terminal-window">
                                        <div className="terminal-header">
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <div className="dot red" /> <div className="dot yellow" /> <div className="dot green" />
                                            </div>
                                            <span>Agent Output</span>
                                        </div>
                                        <div className="terminal-body">
                                            {issueResult ? (
                                                <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>{issueResult}</pre>
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textAlign: 'center' }}>
                                                    <p>Submit your issue to see the agent's diagnosis and fix here.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeAgent === 'reviewer' && (
                            <motion.div key="reviewer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <ShieldCheck color="#34d399" /> PR Reviewer
                                    </h2>
                                    <button onClick={handlePRReview} disabled={loading} className="agent-btn reviewer">
                                        {loading ? <Zap className="animate-spin" size={18} /> : <Code size={18} />}
                                        {loading ? 'Reviewing...' : 'Start Review'}
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ flex: '0 0 auto' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Review Context (Optional)</label>
                                            <input 
                                                value={prContext}
                                                onChange={(e) => setPrContext(e.target.value)}
                                                placeholder="e.g. Fixing authentication logic in login component..."
                                                style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>Code Changes (Diff/New File)</label>
                                            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Editor
                                                    height="100%"
                                                    language="javascript"
                                                    theme="vs-dark"
                                                    value={prCode}
                                                    onChange={(v) => setPrCode(v)}
                                                    options={{ minimap: { enabled: false }, fontSize: 13 }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="review-window">
                                        <div className="review-header">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Bot size={16} color="#34d399" />
                                                <span>Review Feedback</span>
                                            </div>
                                        </div>
                                        <div className="review-body">
                                            {prResult ? (
                                                <div className="markdown-content" style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                                    {prResult.split('\n').map((line, i) => (
                                                        <p key={i}>{line}</p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', textAlign: 'center' }}>
                                                    <p>Paste your code changes to receive a professional architectural review.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <style>{`
                .stat-card {
                    padding: 1.5rem; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); text-align: left;
                }
                .stat-card h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 0.5rem 0; font-size: 0.9rem; }
                .stat-card p { margin: 0; fontSize: 0.8rem; color: #94a3b8; }
                
                .agent-btn {
                    display: flex; align-items: center; gap: 8px; padding: 0.75rem 1.5rem; border-radius: 12px; border: none; cursor: pointer;
                    font-weight: 700; color: white; transition: all 0.3s;
                }
                .agent-btn.resolver { background: linear-gradient(135deg, #ef4444, #f87171); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3); }
                .agent-btn.reviewer { background: linear-gradient(135deg, #10b981, #34d399); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
                .agent-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
                .agent-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .terminal-window, .review-window {
                    display: flex; flexDirection: column; background: #05050a; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden;
                }
                .terminal-header, .review-header {
                    padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex; align-items: center; gap: 12px; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase;
                }
                .terminal-body, .review-body { flex: 1; padding: 1.5rem; overflow-y: auto; }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                .dot.red { background: #ff5f56; }
                .dot.yellow { background: #ffbd2e; }
                .dot.green { background: #27c93f; }
                
                .markdown-content p { margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default AgentDevHubPage;

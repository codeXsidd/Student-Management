import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
    Code2, Play, Cpu, Zap, Activity, Info, AlertTriangle, 
    FastForward, CheckCircle2, ShieldAlert, FlaskConical, ChevronRight, 
    Terminal, Search, Wand2, Layers
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeCode } from '../services/api';

const Typewriter = ({ text, delay = 15 }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        setDisplayedText('');
        if (!text) return;
        
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText((prev) => text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, delay);
        
        return () => clearInterval(timer);
    }, [text, delay]);

    return (
        <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {displayedText.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: '#f8fafc', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', color: '#38bdf8', padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.85em', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.1)' }}>{part.slice(1, -1)}</code>;
                }
                return part;
            })}
        </span>
    );
};

const FormattedText = ({ text }) => {
    if (!text) return null;
    return (
        <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: '#f8fafc', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', color: '#38bdf8', padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.85em', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.1)' }}>{part.slice(1, -1)}</code>;
                }
                return part;
            })}
        </span>
    );
};

const MultiStageLoader = () => {
    const stages = [
        "Analyzing Code Structure...",
        "Identifying Logical Patterns...",
        "Simulating Execution Flow...",
        "Checking for Security Vulnerabilities...",
        "Optimizing Algorithmic Efficiency...",
        "Generating Human-Friendly Insights..."
    ];
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStage(prev => (prev + 1) % stages.length);
        }, 1800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', padding: '2rem' }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', inset: 0, border: '3px solid rgba(99,102,241,0.1)', borderTopColor: '#6366f1', borderRadius: '50%' }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                    style={{ position: 'absolute', inset: 12, border: '3px solid rgba(139,92,246,0.1)', borderBottomColor: '#8b5cf6', borderRadius: '50%' }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={24} color="#6366f1" />
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={stage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}
                    >
                        {stages[stage]}
                    </motion.p>
                </AnimatePresence>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 8 }}>This typically takes a few seconds...</p>
            </div>
        </div>
    );
};

const CodeInsightPage = () => {
    const boilerplates = {
        javascript: '// Write or paste your JavaScript code here...\n\nfunction example() {\n  return "Hello, CodeInsight!";\n}\n\nconsole.log(example());',
        python: '# Write or paste your Python code here...\n\ndef example():\n    return "Hello, CodeInsight!"\n\nif __name__ == "__main__":\n    print(example())',
        java: '// Write or paste your Java code here...\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeInsight!");\n    }\n}',
        cpp: '// Write or paste your C++ code here...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeInsight!" << endl;\n    return 0;\n}'
    };

    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(boilerplates['javascript']);
    const [mode, setMode] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('Explanation'); 

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'python', name: 'Python' },
        { id: 'java', name: 'Java' },
        { id: 'cpp', name: 'C++' }
    ];

    const modes = ['Beginner', 'Interview', 'Debug'];

    const handleAnalyze = async () => {
        if (!code.trim() || (code.includes('// Write or paste your code here') && code.length < 75)) {
            toast.error("Please enter some real code to analyze.");
            return;
        }

        setLoading(true);
        try {
            const res = await analyzeCode({ code, language, mode });
            setResult(res.data);
            setActiveTab('Explanation');
            toast.success("Analysis complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze code. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 100px)', maxWidth: '1600px', margin: '0 auto', overflow: 'hidden', padding: '1rem' }}>
            <Helmet>
                <title>CodeInsight AI — StudyTrack</title>
                <meta name="description" content="AI-powered code explanations, security auditing, and test generation." />
            </Helmet>

            {/* Editor Pane (Left) */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card" style={{ flex: '1 1 45%', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', background: 'rgba(10, 10, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
                        <Code2 color="#6366f1" size={20} /> Code Workspace
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                            value={language} 
                            onChange={(e) => {
                                const newLang = e.target.value;
                                if (Object.values(boilerplates).includes(code) || code.trim() === '') {
                                    setCode(boilerplates[newLang]);
                                }
                                setLanguage(newLang);
                            }}
                            className="select-basic"
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.id} style={{ background: '#1e1e2f' }}>{lang.name}</option>
                            ))}
                        </select>
                        <select 
                            value={mode} 
                            onChange={(e) => setMode(e.target.value)}
                            className="select-accent"
                        >
                            {modes.map(m => (
                                <option key={m} value={m} style={{ background: '#1e1e2f', color: '#e2e8f0' }}>{m} Mode</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            lineHeight: 22
                        }}
                    />
                </div>

                <button 
                    onClick={handleAnalyze} 
                    disabled={loading}
                    className="btn-primary-gradient"
                    style={{ 
                        width: '100%', padding: '0.85rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? (
                        <><Wand2 size={18} className="animate-pulse" /> Decoding Source...</>
                    ) : (
                        <><Play size={18} /> Run AI Analysis</>
                    )}
                </button>
            </motion.div>

            {/* Analysis Pane (Right) */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card" style={{ flex: '1 1 55%', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', background: 'rgba(15, 15, 30, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
                        <Zap color="#fbbf24" size={20} /> Intelligent Insights
                    </h2>
                    {result && <span className="badge-glass">Algorithm Analyzed</span>}
                </div>

                {loading ? (
                    <MultiStageLoader />
                ) : result ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                        {/* Improved Tabs */}
                        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflowX: 'auto' }} className="hide-scrollbar">
                            {[
                                { id: 'Explanation', icon: <Info size={14} />, label: 'Explain' },
                                { id: 'Execution', icon: <Terminal size={14} />, label: 'Exec Flow' },
                                { id: 'TestLab', icon: <FlaskConical size={14} />, label: 'Test Lab' },
                                { id: 'Security', icon: <ShieldAlert size={14} />, label: 'Security' },
                                { id: 'Optimization', icon: <Zap size={14} />, label: 'Refactor' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '0.6rem 0.85rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.3s', whiteSpace: 'nowrap',
                                        background: activeTab === tab.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                                        color: activeTab === tab.id ? '#818cf8' : '#94a3b8',
                                        border: 'none',
                                        boxShadow: activeTab === tab.id ? '0 4px 12px rgba(99,102,241,0.1)' : 'none'
                                    }}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                            
                            {activeTab === 'Explanation' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="insight-section-green">
                                        <h3 className="insight-title-green"><Search size={16} /> Human-Readable Summary</h3>
                                        <div className="insight-text"><Typewriter text={result.simpleSummary} /></div>
                                    </div>
                                    
                                    <div className="insight-section-gold">
                                        <h3 className="insight-title-gold"><FastForward size={16} /> Real-Life Analogy</h3>
                                        <div className="insight-text-italic">"<Typewriter text={result.analogy} delay={30} />"</div>
                                    </div>

                                    <div className="insight-section-indigo">
                                        <h3 className="insight-title-indigo"><Cpu size={16} /> Behind the Scenes</h3>
                                        <div className="insight-text"><FormattedText text={result.backgroundExecution} /></div>
                                    </div>

                                    <div>
                                        <h3 className="insight-subheading">Step-by-Step Breakdown</h3>
                                        {result.stepByStep?.map((step, idx) => (
                                            <motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, x: -10 }} 
                                                animate={{ opacity: 1, x: 0 }} 
                                                transition={{ delay: idx * 0.1 }}
                                                className="step-card"
                                            >
                                                <div className="step-count">LINE {step.line || '?'}</div>
                                                <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{step.explanation}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Execution' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="metrics-card red">
                                            <h4><Activity size={16} /> Time</h4>
                                            <p>{result.timeComplexity}</p>
                                        </div>
                                        <div className="metrics-card blue">
                                            <h4><Layers size={16} /> Space</h4>
                                            <p>{result.spaceComplexity}</p>
                                        </div>
                                    </div>

                                    <div className="insight-block">
                                        <h3 className="insight-title-gray"><Terminal size={16} /> Simulation (Dry Run)</h3>
                                        <div className="insight-text"><FormattedText text={result.dryRun} /></div>
                                    </div>

                                    <div className="viz-terminal">
                                        <div className="viz-header">
                                            <div className="viz-dot red-dot" /> <div className="viz-dot yellow-dot" /> <div className="viz-dot green-dot" />
                                            <span>Visualizer Output</span>
                                        </div>
                                        <pre className="viz-pre">{result.visualization}</pre>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'TestLab' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <h3 className="insight-subheading">Generated Edge Cases & Tests</h3>
                                    {result.testCases?.map((tc, i) => (
                                        <div key={i} className="test-case-card">
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                                <div className="test-io">
                                                    <span>INPUT</span>
                                                    <code>{tc.input}</code>
                                                </div>
                                                <div className="test-io">
                                                    <span>EXPECTED</span>
                                                    <code className="text-emerald">{tc.output}</code>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}><strong>Logic:</strong> {tc.explanation}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'Security' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="security-banner">
                                        <ShieldAlert size={24} color="#f87171" />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>AI Security Audit</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>Identifying potential risks and vulnerabilities</p>
                                        </div>
                                    </div>
                                    <div className="insight-block-rose">
                                        <div className="insight-text"><FormattedText text={result.securityAudit} /></div>
                                    </div>
                                    <div className="security-tips">
                                        <h4 style={{ fontSize: '0.9rem', color: '#fca5a5', marginBottom: '0.5rem' }}>Proactive Shielding:</h4>
                                        <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Always sanitize user inputs and avoid direct execution of dynamic strings to prevent injection vectors.</p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'Optimization' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="insight-block-amber">
                                        <h3 className="insight-title-amber"><AlertTriangle size={16} /> Logic Refinement</h3>
                                        <div className="insight-text"><FormattedText text={result.mistakes} /></div>
                                    </div>

                                    <div className="insight-block-indigo">
                                        <h3 className="insight-title-indigo"><Wand2 size={16} /> Refactoring Logic</h3>
                                        <div className="insight-text"><FormattedText text={result.refactorReasoning || result.optimalSolution} /></div>
                                    </div>

                                    <div className="code-output-container">
                                        <div className="code-header">
                                            <span>Optimized Solution</span>
                                            <button className="copy-btn" onClick={() => { navigator.clipboard.writeText(result.optimizedCode); toast.success("Copied to clipboard!"); }}>Copy</button>
                                        </div>
                                        <pre className="code-pre">{result.optimizedCode}</pre>
                                    </div>

                                    <div className="insight-grid">
                                        <div className="grid-cell">
                                            <h5>🚀 Beginner Tips</h5>
                                            <p>{result.beginnerTips}</p>
                                        </div>
                                        <div className="grid-cell highlight">
                                            <h5>🔬 Interview Insight</h5>
                                            <p>{result.interviewInsight}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.5 }}>
                        <div className="empty-state-icon">
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Code2 size={42} color="#818cf8" />
                            </motion.div>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>CodeInsight AI Ready</h3>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '320px' }}>Input your algorithm to receive a semantic breakdown, security audit, and optimized refactoring.</p>
                    </div>
                )}
            </motion.div>

            <style>{`
                .btn-primary-gradient {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
                }
                .btn-primary-gradient:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
                    filter: brightness(1.1);
                }
                .badge-glass {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 0.25rem 0.6rem;
                    border-radius: 20px;
                    background: rgba(99,102,241,0.1);
                    color: #818cf8;
                    border: 1px solid rgba(99,102,241,0.2);
                }
                .select-basic {
                    background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.1); 
                    padding: 0.4rem 0.8rem; borderRadius: 8px; fontSize: '0.8rem'; outline: 'none'; transition: 'all 0.2s';
                }
                .select-accent {
                    background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); 
                    padding: 0.4rem 0.8rem; borderRadius: 8px; fontSize: '0.8rem'; outline: 'none'; fontWeight: 700;
                }
                .insight-section-green { padding: 1.25rem; border-radius: 16px; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.15); }
                .insight-title-green { font-size: 0.85rem; color: #34d399; font-weight: 800; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8; text-transform: uppercase; letter-spacing: 0.03em; }
                .insight-section-gold { padding: 1.25rem; border-radius: 16px; background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.15); }
                .insight-title-gold { font-size: 0.85rem; color: #fbbf24; font-weight: 800; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8; text-transform: uppercase; letter-spacing: 0.03em; }
                .insight-section-indigo { padding: 1.25rem; border-radius: 16px; background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.15); }
                .insight-title-indigo { font-size: 0.85rem; color: #818cf8; font-weight: 800; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8; text-transform: uppercase; letter-spacing: 0.03em; }
                .insight-text { font-size: 0.92rem; color: #e2e8f0; line-height: 1.8; }
                .insight-text-italic { font-size: 0.92rem; color: #cbd5e1; line-height: 1.8; font-style: italic; }
                .insight-subheading { font-size: 0.85rem; color: #64748b; font-weight: 800; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem; }
                .step-card { padding: 1rem; border-radius: 10px; background: rgba(255,255,255,0.02); border-left: 3px solid #6366f1; margin-bottom: 0.75rem; }
                .step-count { font-size: 0.7rem; font-weight: 800; color: #818cf8; margin-bottom: 0.4rem; }
                .metrics-card { padding: 1rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); }
                .metrics-card h4 { margin: 0 0 0.5rem 0; font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: flex; items-center; gap: 6; }
                .metrics-card p { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f1f5f9; }
                .metrics-card.red { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2); }
                .metrics-card.red p { color: #fca5a5; }
                .metrics-card.blue { background: rgba(56,189,248,0.05); border-color: rgba(56,189,248,0.2); }
                .metrics-card.blue p { color: #7dd3fc; }
                .insight-block { padding: 1.25rem; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); }
                .insight-title-gray { font-size: 0.85rem; color: #94a3b8; font-weight: 800; margin-bottom: 0.75rem; display: flex; items-center; gap: 8; text-transform: uppercase; }
                .viz-terminal { background: #0a0a14; border-radius: 12px; border: 1px solid rgba(99,102,241,0.2); overflow: hidden; }
                .viz-header { padding: 0.75rem 1rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; items-center; gap: 8; }
                .viz-header span { font-size: 0.65rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-left: 8px; }
                .viz-dot { width: 8px; height: 8px; border-radius: 50%; }
                .red-dot { background: #ff5f56; } .yellow-dot { background: #ffbd2e; } .green-dot { background: #27c93f; }
                .viz-pre { margin: 0; padding: 1.25rem; font-size: 0.95rem; color: #34d399; font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1.6; }
                .test-case-card { padding: 1rem; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
                .test-io { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .test-io span { font-size: 0.6rem; font-weight: 800; color: #64748b; }
                .test-io code { padding: 0.5rem; background: #0a0a0f; border-radius: 6px; font-size: 0.9rem; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.05); }
                .text-emerald { color: #10b981 !important; }
                .security-banner { display: flex; gap: 12px; align-items: center; padding: 1.25rem; background: rgba(239,68,68,0.1); border-radius: 16px; border: 1px solid rgba(239,68,68,0.2); }
                .insight-block-rose { padding: 1.25rem; border-radius: 16px; background: rgba(244,63,94,0.03); border: 1px solid rgba(244,63,94,0.1); }
                .security-tips { padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 12px; border-left: 3px solid #f87171; }
                .insight-block-amber { padding: 1.25rem; border-radius: 16px; background: rgba(245,158,11,0.04); border: 1px solid rgba(245,158,11,0.15); }
                .insight-title-amber { font-size: 0.85rem; color: #fbbf24; font-weight: 800; margin-bottom: 0.75rem; display: flex; items-center; gap: 8; text-transform: uppercase; }
                .code-output-container { background: #05050a; border-radius: 16px; border: 1px solid rgba(99,102,241,0.2); overflow: hidden; }
                .code-header { padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .code-header span { font-size: 0.75rem; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 0.05em; }
                .copy-btn { font-size: 0.7rem; font-weight: 700; color: #94a3b8; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 0.25rem 0.6rem; border-radius: 4px; cursor: pointer; }
                .copy-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .code-pre { margin: 0; padding: 1.5rem; font-size: 0.92rem; color: #c4b5fd; font-family: 'Fira Code', monospace; line-height: 1.7; overflow-x: auto; }
                .insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .grid-cell { padding: 1rem; border-radius: 14px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }
                .grid-cell h5 { margin: 0 0 0.5rem 0; font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
                .grid-cell p { margin: 0; font-size: 0.88rem; color: #cbd5e1; line-height: 1.6; }
                .grid-cell.highlight { background: rgba(99,102,241,0.03); border-color: rgba(99,102,241,0.15); }
                .grid-cell.highlight h5 { color: #818cf8; }
                
                @media (max-width: 1024px) {
                    .page-container { flex-direction: column !important; overflow-y: auto !important; height: auto !important; }
                    .glass-card { flex: none !important; min-height: 600px; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .empty-state-icon { width: 90px; height: 90px; border-radius: 50%; background: rgba(99,102,241,0.03); border: 1px dashed rgba(99,102,241,0.2); display: flex; items-center; justify-center; margin-bottom: 1.5rem; }
            `}</style>
        </div>
    );
};

export default CodeInsightPage;

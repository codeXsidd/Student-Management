import React, { useState, useEffect } from 'react';
import API, { parseMindSweep, getSubjects, addAssignment, addNote } from '../services/api';
import toast from 'react-hot-toast';
import { Wand2, Loader, Save, Trash2, CheckCircle2, AlertCircle, FileText, CheckSquare } from 'lucide-react';

const AiMindSweepPage = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Parsed results
    const [todos, setTodos] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [notes, setNotes] = useState([]);

    // We need subjects for assignments
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        getSubjects().then(res => setSubjects(res.data)).catch(() => {});
    }, []);

    const handleOrganize = async () => {
        if (!text.trim()) return toast.error("Write down your thoughts first!");
        
        setLoading(true);
        try {
            const res = await parseMindSweep({ text });
            setTodos(res.data.todos || []);
            setAssignments(res.data.assignments || []);
            setNotes(res.data.notes || []);
            toast.success("Mind organized! Review and save below.", { icon: '✨' });
        } catch (error) {
            toast.error("Failed to organize your thoughts.");
        }
        setLoading(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        let successCount = 0;

        try {
            // Save Todos
            for (const t of todos) {
                await API.post('/todos', {
                    title: t.title,
                    priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
                    category: t.category || 'Study',
                    dayPlan: t.dayPlan === true
                });
                successCount++;
            }

            // Save Assignments
            for (const a of assignments) {
                if (subjects.length > 0) {
                    await addAssignment({
                        title: a.title,
                        description: a.description || 'Generated from Mind Sweep',
                        deadline: a.deadline || new Date().toISOString(),
                        priority: ['high', 'medium', 'low'].includes(a.priority?.toLowerCase()) ? a.priority.toLowerCase() : 'medium',
                        subjectId: subjects[0]._id // Fallback to first subject
                    });
                    successCount++;
                } else {
                    toast.error(`Could not save assignment: "${a.title}" because you have no subjects created.`);
                }
            }

            // Save Notes
            for (const n of notes) {
                await addNote({
                    title: n.title,
                    content: n.content || '',
                    tags: n.tags || ['BrainDump']
                });
                successCount++;
            }

            if (successCount > 0) {
                toast.success(`Successfully saved ${successCount} items to your dashboard!`, { icon: '🚀', duration: 4000 });
                // Clear the state so user can start fresh
                setTodos([]);
                setAssignments([]);
                setNotes([]);
                setText('');
            }

        } catch (error) {
            toast.error("An error occurred while saving to the database.");
            console.error(error);
        }
        setIsSaving(false);
    };

    const hasResults = todos.length > 0 || assignments.length > 0 || notes.length > 0;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ 
                    width: 64, height: 64, borderRadius: '50%', marginBottom: '1.25rem',
                    background: 'linear-gradient(135deg, #c084fc, #ec4899)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
                }}>
                    <Wand2 size={32} color="white" />
                </div>
                <h1 style={{ 
                    fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem',
                    background: 'linear-gradient(to right, #c084fc, #f472b6)', 
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
                }}>
                    AI Mind Sweep
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 650, margin: '0 auto' }}>
                    Clear your head. Dump your chaotic thoughts, tasks, and deadlines below. The AI will instantly untangle them into an organized action plan.
                </p>
            </div>

            {/* Input Area */}
            <div style={{ 
                padding: '1.5rem', marginBottom: '3rem', 
                background: 'rgba(8,8,18,0.4)', borderRadius: '16px', 
                border: '1px solid rgba(255,255,255,0.05)' 
            }}>
                <textarea
                    className="input"
                    style={{ 
                        width: '100%', minHeight: '180px', padding: '1.25rem', fontSize: '1.05rem', 
                        background: 'transparent', resize: 'vertical', lineHeight: 1.6, 
                        border: 'none', color: '#e2e8f0', outline: 'none'
                    }}
                    placeholder={"Type loosely. E.g., 'I have a massive history essay due next Friday, plus I need to grab milk tonight. Remember to text mom. Oh, and here's a random idea: use a neural network for predictions!'" }
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button 
                        onClick={handleOrganize} 
                        disabled={loading || !text.trim()} 
                        className="btn-primary" 
                        style={{ 
                            background: 'linear-gradient(135deg, #c084fc, #ec4899)', 
                            display: 'flex', alignItems: 'center', gap: 8, 
                            padding: '0.75rem 2rem', fontSize: '1rem', border: 'none' 
                        }}
                    >
                        {loading ? <Loader size={18} className="spin" /> : <Wand2 size={18} />}
                        Organize My Mind
                    </button>
                </div>
            </div>

            {/* Results */}
            {hasResults && (
                <div className="fade-up">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0' }}>Your Organized Plan</h2>
                        <button 
                            onClick={handleSaveAll} 
                            disabled={isSaving}
                            className="btn-primary"
                            style={{ background: '#10b981', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                        >
                            {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                            Save All to Dashboard
                        </button>
                    </div>

                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                        
                        {/* Todos Column */}
                        <div style={{ 
                            padding: '1.5rem', borderRadius: '16px', 
                            background: 'rgba(15,15,30,0.6)', border: '1px solid #3b82f6',
                            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                                <CheckSquare size={22} color="#3b82f6" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Action Items</h3>
                            </div>
                            {todos.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No direct tasks found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {todos.map((t, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                <input className="input" style={{ flex: 1, padding: 0, fontSize: '0.95rem', background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 600 }} value={t.title} onChange={e => {
                                                    const newArr = [...todos]; newArr[idx].title = e.target.value; setTodos(newArr);
                                                }} />
                                                <button onClick={() => setTodos(todos.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444', flexShrink: 0, marginTop: 2 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                {t.dayPlan && <span style={{ fontSize: '0.65rem', background: 'rgba(2ec4899,0.1)', color: '#f472b6', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>DO TODAY</span>}
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>{t.priority}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assignments Column */}
                        <div style={{ 
                            padding: '1.5rem', borderRadius: '16px', 
                            background: 'rgba(15,15,30,0.6)', border: '1px solid #f59e0b',
                            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                                <AlertCircle size={22} color="#f59e0b" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Big Projects</h3>
                            </div>
                            {assignments.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No major assignments found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {assignments.map((a, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                <input className="input" style={{ flex: 1, padding: 0, fontSize: '0.95rem', background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 600 }} value={a.title} onChange={e => {
                                                    const newArr = [...assignments]; newArr[idx].title = e.target.value; setAssignments(newArr);
                                                }} />
                                                <button onClick={() => setAssignments(assignments.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444', flexShrink: 0, marginTop: 2 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {a.deadline && (
                                                <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: 10, margin: '10px 0 0 0' }}>
                                                    Due: {new Date(a.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes Column */}
                        <div style={{ 
                            padding: '1.5rem', borderRadius: '16px', 
                            background: 'rgba(15,15,30,0.6)', border: '1px solid #10b981',
                            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
                                <FileText size={22} color="#10b981" />
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Notes & Ideas</h3>
                            </div>
                            {notes.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No scattered notes found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {notes.map((n, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 10 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                                <input className="input" style={{ flex: 1, padding: 0, fontSize: '0.95rem', background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 600 }} value={n.title} onChange={e => {
                                                    const newArr = [...notes]; newArr[idx].title = e.target.value; setNotes(newArr);
                                                }} />
                                                <button onClick={() => setNotes(notes.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#ef4444', flexShrink: 0, marginTop: 2 }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: 10, margin: '10px 0 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
                                                {n.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AiMindSweepPage;

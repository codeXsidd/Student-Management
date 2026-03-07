import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Calendar, Star, Layout, ListTodo, Sun, Coffee, Brain, Sparkles, ChevronRight, X } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const todayDate = () => new Date().toISOString().split('T')[0];

const DailyPlannerPage = () => {
    const [allTodos, setAllTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newQuickTask, setNewQuickTask] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await API.get('/todos'); setAllTodos(res.data); }
            catch { toast.error('Failed to load tasks'); }
            setLoading(false);
        };
        fetch();
    }, []);

    const dayPlanTasks = allTodos.filter(t => t.dayPlan && !t.completed);
    const completedToday = allTodos.filter(t => t.completed && t.completedAt && t.completedAt.split('T')[0] === todayDate());
    const potentialTasks = allTodos.filter(t => !t.dayPlan && !t.completed);

    const toggleDayPlan = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { dayPlan: !todo.dayPlan });
            setAllTodos(allTodos.map(t => t._id === todo._id ? res.data : t));
            if (!todo.dayPlan) toast.success('Added to today\'s plan! 🚀');
        } catch { toast.error('Update failed'); }
    };

    const toggleComplete = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { completed: !todo.completed, dayPlan: false });
            setAllTodos(allTodos.map(t => t._id === todo._id ? res.data : t));
            if (!todo.completed) toast.success('Awesome! Task done! ✅');
        } catch { toast.error('Update failed'); }
    };

    const addQuickTask = async (e) => {
        if (e.key && e.key !== 'Enter') return;
        if (!newQuickTask.trim()) return;
        setSaving(true);
        try {
            const res = await API.post('/todos', { title: newQuickTask, dayPlan: true, priority: 'Medium', category: 'Study' });
            setAllTodos([res.data, ...allTodos]);
            setNewQuickTask('');
            toast.success('Quick task added for today!');
        } catch { toast.error('Failed'); }
        setSaving(false);
    };

    const removeTask = async (id) => {
        try {
            await API.delete(`/todos/${id}`);
            setAllTodos(allTodos.filter(t => t._id !== id));
            toast.success('Deleted');
        } catch { toast.error('Failed'); }
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

            {/* ── HEADER ── */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Sun size={28} color="#f59e0b" className="float" />
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Daily Planner</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Plan your wins for today.
                </p>
            </div>

            <div className="dashboard-grid-hero" style={{ gap: '2rem' }}>

                {/* ── LEFT COLUMN: THE ACTIVE DAY PLAN ── */}
                <div>
                    <div className="glass-card glow-anim" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(99,102,241,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            <Target size={22} color="#6366f1" />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Today's Focus</h2>
                        </div>

                        {/* Quick Task Input */}
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <input
                                className="input"
                                placeholder="Write a quick task for today..."
                                style={{ padding: '0.8rem 1rem', paddingLeft: '2.8rem', fontSize: '1rem', background: 'rgba(15,15,26,0.95)' }}
                                value={newQuickTask}
                                onChange={e => setNewQuickTask(e.target.value)}
                                onKeyDown={addQuickTask}
                            />
                            <Plus size={20} color="#6366f1" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        </div>

                        {/* The Plan List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {dayPlanTasks.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.6 }}>
                                    <Coffee size={40} color="#64748b" style={{ marginBottom: 10 }} />
                                    <p style={{ fontSize: '0.9rem' }}>No tasks in your daily plan yet.</p>
                                    <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Pick some from your backlog on the right →</p>
                                </div>
                            ) : dayPlanTasks.map((todo, idx) => (
                                <div key={todo._id} className="glass-card fade-in" style={{
                                    padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                                    borderLeft: `4px solid ${todo.priority === 'High' ? '#ef4444' : todo.priority === 'Medium' ? '#f59e0b' : '#10b981'}`,
                                    animationDelay: `${idx * 0.05}s`
                                }}>
                                    <button onClick={() => toggleComplete(todo)} style={{
                                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                                        border: '2.5px solid #6366f133', background: 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }} onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'} onMouseLeave={e => e.currentTarget.style.borderColor = '#6366f133'}>
                                        <Check size={16} color="white" style={{ opacity: 0 }} onMouseEnter={e => e.currentTarget.style.opacity = 0.5} onMouseLeave={e => e.currentTarget.style.opacity = 0} />
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{todo.title}</p>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8' }}>{todo.category}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: todo.priority === 'High' ? '#ef4444' : '#94a3b8' }}>• {todo.priority} Priority</span>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleDayPlan(todo)} title="Remove from plan" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
                                        <X size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Today */}
                    {completedToday.length > 0 && (
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done Today 🎉</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {completedToday.map(todo => (
                                    <div key={todo._id} className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: 0.5 }}>
                                        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Check size={13} color="white" />
                                        </div>
                                        <p style={{ fontSize: '0.88rem', textDecoration: 'line-through', color: '#94a3b8', flex: 1 }}>{todo.title}</p>
                                        <button onClick={() => removeTask(todo._id)} style={{ color: '#ef444433', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: BACKLOG / PLANNING BRIDGE ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            <Brain size={22} color="#a78bfa" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Plan Your Day</h2>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                            Select tasks from your backlog to move them into today's focus.
                            Keeping it to <b>3-5 tasks</b> leads to maximum productivity!
                        </p>

                        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {potentialTasks.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                                    Backlog is empty. <br />
                                    When you add tasks and un-check them from<br />Today's Focus, they will appear here!
                                </p>
                            ) : potentialTasks.map(todo => (
                                <div key={todo._id} className="glass-card" style={{
                                    padding: '0.85rem', marginBottom: '0.6rem', background: 'rgba(15,15,26,0.3)',
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(99,102,241,0.05)',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,15,26,0.3)'}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{todo.title}</p>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                                            <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{todo.category}</span>
                                            {todo.dueDate && (
                                                <span style={{ fontSize: '0.6rem', color: (new Date(todo.dueDate) - new Date()) / 86400000 <= 1 ? '#ef4444' : '#64748b' }}>
                                                    • Due {new Date(todo.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => toggleDayPlan(todo)} style={{
                                        padding: '0.4rem 0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '0.75rem',
                                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                    }}>
                                        Add <ChevronRight size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Sparkles size={16} color="#10b981" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Pro Tip</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            Focus on "Deep Work" sessions. Use the <b>Pomodoro Timer</b> along with your daily plan to stay in the zone.
                        </p>
                    </div>

                </div>
            </div>

            <style>{`
                .float { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
};

export default DailyPlannerPage;

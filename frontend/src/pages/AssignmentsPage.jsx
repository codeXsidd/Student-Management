import React, { useState, useEffect } from 'react';
import { getSubjects, getAssignments, addAssignment, updateAssignment, deleteAssignment, addXP } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ListTodo, Plus, Trash2, CheckCircle, Circle, Clock, ChevronDown, Filter } from 'lucide-react';

const PRIORITIES = ['low', 'medium', 'high'];
const priorityColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };

const AssignmentsPage = () => {
    const { updateUserXP } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', subjectId: '', deadline: '', priority: 'medium' });

    const fetchAll = async () => {
        try {
            const [aRes, sRes] = await Promise.all([getAssignments(), getSubjects()]);
            setAssignments(aRes.data);
            setSubjects(sRes.data);
            if (sRes.data.length > 0 && !form.subjectId) {
                setForm(f => ({ ...f, subjectId: sRes.data[0]._id }));
            }
        } catch { toast.error('Failed to load data'); }
    };

    useEffect(() => { fetchAll(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.title || !form.subjectId || !form.deadline) return toast.error('Fill all required fields');
        setLoading(true);
        try {
            const res = await addAssignment(form);
            setAssignments([...assignments, res.data]);
            setForm(f => ({ ...f, title: '', description: '', deadline: '' }));
            setShowForm(false);
            toast.success('Assignment added!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add assignment');
        } finally { setLoading(false); }
    };

    const handleToggle = async (id, current) => {
        try {
            const res = await updateAssignment(id, { completed: !current });
            setAssignments(assignments.map(a => a._id === id ? res.data : a));
            
            if (!current) {
                toast.success('Awesome work! Assignment completed! ✅');
                addXP({ xpToAdd: 50 }).then(xpRes => {
                    updateUserXP(xpRes.data.xp, xpRes.data.level);
                    if (xpRes.data.leveledUp) {
                        toast.success(`🎉 Level Up! You are now level ${xpRes.data.level}!`, { duration: 5000, icon: '🌟' });
                    } else {
                        toast.success(`+50 XP for grinding through your assignment!`, { icon: '✨' });
                    }
                }).catch(() => {});
            } else {
                toast.success('Marked as pending');
            }
        } catch { toast.error('Failed to update'); }
    };

    const handleDelete = async (id) => {
        try {
            await deleteAssignment(id);
            setAssignments(assignments.filter(a => a._id !== id));
            toast.success('Assignment deleted');
        } catch { toast.error('Failed to delete'); }
    };

    const getDaysLeft = (deadline) => Math.ceil((new Date(deadline) - new Date()) / 86400000);

    const filtered = assignments.filter(a => {
        if (filter === 'pending') return !a.completed;
        if (filter === 'done') return a.completed;
        return true;
    });

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <ListTodo size={24} color="#6366f1" />
                    <span>Assignments</span>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> New Assignment
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="glass-card fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: '#cbd5e1' }}>New Assignment</h3>
                    <form onSubmit={handleAdd}>
                        <div className="dashboard-grid" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Title *</label>
                                <input className="input" placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Subject *</label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })} style={{ appearance: 'none', paddingRight: '2rem' }}>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Deadline *</label>
                                <input type="datetime-local" className="input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Priority</label>
                                <div style={{ position: 'relative' }}>
                                    <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ appearance: 'none', paddingRight: '2rem' }}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Description (optional)</label>
                            <textarea className="input" placeholder="Add notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.55rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Assignment'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'done', label: 'Completed' }].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)} style={{
                        padding: '0.4rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                        background: filter === f.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
                        border: filter === f.key ? 'none' : '1px solid rgba(99,102,241,0.2)',
                        color: filter === f.key ? 'white' : '#94a3b8'
                    }}>{f.label} ({assignments.filter(a => f.key === 'all' ? true : f.key === 'pending' ? !a.completed : a.completed).length})</button>
                ))}
            </div>

            {/* Assignment Cards */}
            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <ListTodo size={48} color="#6366f133" style={{ marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No assignments here. Click "New Assignment" to add one!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filtered.map(a => {
                        const days = getDaysLeft(a.deadline);
                        const isOverdue = days < 0 && !a.completed;
                        return (
                            <div key={a._id} className="glass-card fade-in" style={{
                                padding: '1.1rem 1.25rem',
                                borderLeft: `3px solid ${a.completed ? '#10b981' : isOverdue ? '#ef4444' : priorityColor[a.priority]}`,
                                opacity: a.completed ? 0.7 : 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <button onClick={() => handleToggle(a._id, a.completed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: a.completed ? '#10b981' : '#64748b', marginTop: 2, padding: 0 }}>
                                        {a.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                                    </button>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <p style={{ fontWeight: 700, fontSize: '0.95rem', textDecoration: a.completed ? 'line-through' : 'none', color: a.completed ? '#64748b' : '#e2e8f0' }}>
                                                    {a.title}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                                    <span style={{ fontSize: '0.75rem', color: a.subject?.color || '#6366f1' }}>● {a.subject?.name}</span>
                                                    <span className={`badge badge-${a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'success'}`}>{a.priority}</span>
                                                </div>
                                                {a.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{a.description}</p>}
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                                                    <Clock size={13} color={isOverdue ? '#ef4444' : days <= 2 ? '#f59e0b' : '#94a3b8'} />
                                                    <span style={{ color: isOverdue ? '#ef4444' : days <= 2 ? '#f59e0b' : '#94a3b8', fontWeight: 600 }}>
                                                        {a.completed ? 'Completed ✓' : isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today!' : `${days}d left`}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(a.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <button onClick={() => handleDelete(a._id)} className="btn-danger" style={{ padding: '0.25rem 0.5rem', marginTop: 2 }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssignmentsPage;

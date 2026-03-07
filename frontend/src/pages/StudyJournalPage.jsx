import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Flame, Calendar, Clock, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import API from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const SECTIONS = ['Study Session', 'Lecture Notes', 'Exam Prep', 'Lab Work', 'Project Work', 'Reflection', 'Personal'];
const SECTION_ICONS = {
    'Study Session': '📚', 'Lecture Notes': '📒', 'Exam Prep': '🎯',
    'Lab Work': '🔬', 'Project Work': '🚀', 'Reflection': '🧘', 'Personal': '🌟'
};
const SECTION_COLORS = {
    'Study Session': '#6366f1', 'Lecture Notes': '#8b5cf6', 'Exam Prep': '#ef4444',
    'Lab Work': '#10b981', 'Project Work': '#f97316', 'Reflection': '#14b8a6', 'Personal': '#ec4899'
};
const MOODS = ['😴', '😐', '⚡', '🔥'];
const MOOD_LABELS = { '😴': 'Tired', '😐': 'Okay', '⚡': 'Energized', '🔥': 'On Fire!' };

const todayStr = () => new Date().toISOString().split('T')[0];
const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StudyJournalPage = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ date: todayStr(), section: 'Study Session', subjects: '', topics: '', hoursStudied: 1, mood: '⚡', notes: '' });
    const [saving, setSaving] = useState(false);
    const [heatmapOffset, setHeatmapOffset] = useState(0);

    useEffect(() => {
        const load = async () => {
            try { const res = await API.get('/journal'); setEntries(res.data); }
            catch { toast.error('Failed to load journal'); }
            setLoading(false);
        };
        load();
    }, []);

    const saveEntry = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, subjects: form.subjects.split(',').map(s => s.trim()).filter(Boolean) };
            const res = await API.post('/journal', payload);
            setEntries(prev => {
                const filtered = prev.filter(e => !(e.date === form.date && e.section === form.section));
                return [res.data, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
            });
            setShowForm(false);
            toast.success(`${SECTION_ICONS[form.section]} Session logged!`);
        } catch (err) {
            if (err.response?.status === 409) toast.error('Entry for this section+date already exists');
            else toast.error('Failed to save');
        }
        setSaving(false);
    };

    const deleteEntry = async (id) => {
        try {
            await API.delete(`/journal/${id}`);
            setEntries(prev => prev.filter(e => e._id !== id));
            toast.success('Deleted');
        } catch { toast.error('Failed'); }
    };

    // Filtered entries by section tab
    const filtered = activeSection === 'All' ? entries : entries.filter(e => e.section === activeSection);

    // Stats
    const totalHours = entries.reduce((a, e) => a + (e.hoursStudied || 0), 0);
    const totalDays = [...new Set(entries.map(e => e.date))].length;

    // Streak
    const sortedDates = [...new Set(entries.map(e => e.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let cur = todayStr();
    for (const d of sortedDates) {
        if (d === cur) { streak++; const dt = new Date(d); dt.setDate(dt.getDate() - 1); cur = dt.toISOString().split('T')[0]; } else break;
    }

    // Section distribution for filtered + stats
    const sectionCounts = SECTIONS.reduce((acc, s) => { acc[s] = entries.filter(e => e.section === s).length; return acc; }, {});

    // Heatmap (hours per day)
    const entryMap = {};
    entries.forEach(e => { entryMap[e.date] = (entryMap[e.date] || 0) + (e.hoursStudied || 0); });

    const heatmapEnd = new Date();
    heatmapEnd.setDate(heatmapEnd.getDate() - heatmapOffset * 7);
    const heatmapStart = new Date(heatmapEnd);
    heatmapStart.setDate(heatmapStart.getDate() - 17 * 7 + 1);
    const weeks = [];
    const c = new Date(heatmapStart);
    c.setDate(c.getDate() - ((c.getDay() + 6) % 7));
    while (c <= heatmapEnd) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const ds = c.toISOString().split('T')[0];
            week.push({ ds, h: entryMap[ds] || 0, inRange: c >= heatmapStart && c <= heatmapEnd });
            c.setDate(c.getDate() + 1);
        }
        weeks.push(week);
    }
    const heatColor = (h) => {
        if (!h) return 'rgba(99,102,241,0.06)';
        if (h >= 8) return '#6366f1';
        if (h >= 5) return '#818cf8';
        if (h >= 2) return '#a5b4fc';
        return '#c7d2fe33';
    };

    // Weekly chart
    const weekLabels = [], weekHours = [];
    for (let w = 6; w >= 0; w--) {
        const we = new Date(); we.setDate(we.getDate() - w * 7);
        const ws = new Date(we); ws.setDate(ws.getDate() - 6);
        weekLabels.push(ws.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
        weekHours.push(entries.filter(e => e.date >= ws.toISOString().split('T')[0] && e.date <= we.toISOString().split('T')[0]).reduce((a, e) => a + (e.hoursStudied || 0), 0));
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
                    <BookOpen size={26} color="#6366f1" /> Study Journal
                </h2>
                <button className="btn-primary" onClick={() => { setForm({ date: todayStr(), section: activeSection !== 'All' ? activeSection : 'Study Session', subjects: '', topics: '', hoursStudied: 1, mood: '⚡', notes: '' }); setShowForm(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> Log Session
                </button>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{ marginBottom: '1.25rem' }}>
                {[
                    { label: 'Study Streak', value: streak > 0 ? `🔥 ${streak}d` : '—', color: '#ef4444' },
                    { label: 'Total Hours', value: `${totalHours}h`, color: '#6366f1' },
                    { label: 'Days Logged', value: totalDays, color: '#10b981' },
                    { label: 'Avg per Day', value: totalDays ? `${(totalHours / totalDays).toFixed(1)}h` : '—', color: '#f59e0b' }
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button onClick={() => setActiveSection('All')} style={{
                    padding: '0.35rem 0.9rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600,
                    background: activeSection === 'All' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.08)',
                    border: activeSection === 'All' ? 'none' : '1px solid rgba(99,102,241,0.18)',
                    color: activeSection === 'All' ? 'white' : '#94a3b8'
                }}>All ({entries.length})</button>
                {SECTIONS.map(s => {
                    const cnt = sectionCounts[s];
                    const isActive = activeSection === s;
                    const col = SECTION_COLORS[s];
                    return (
                        <button key={s} onClick={() => setActiveSection(s)} style={{
                            padding: '0.35rem 0.75rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            background: isActive ? `${col}22` : 'rgba(15,15,26,0.5)',
                            border: `1.5px solid ${isActive ? col : 'rgba(99,102,241,0.1)'}`,
                            color: isActive ? col : '#64748b', transition: 'all 0.15s'
                        }}>
                            {SECTION_ICONS[s]} {s} {cnt > 0 ? `(${cnt})` : ''}
                        </button>
                    );
                })}
            </div>

            {/* Heatmap */}
            <div className="glass-card" style={{ padding: '1.1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>📅 Study Activity Heatmap</p>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button onClick={() => setHeatmapOffset(o => o + 1)} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, padding: '0.15rem 0.45rem', cursor: 'pointer', color: '#818cf8' }}><ChevronLeft size={13} /></button>
                        <button onClick={() => setHeatmapOffset(o => Math.max(0, o - 1))} style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 5, padding: '0.15rem 0.45rem', cursor: 'pointer', color: '#818cf8' }}><ChevronRight size={13} /></button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: 3, paddingTop: 16 }}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{ width: 10, height: 12, fontSize: '0.52rem', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</div>)}
                    </div>
                    {weeks.map((wk, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {wk.map((day, di) => (
                                <div key={di} title={`${day.ds}: ${day.h}h`} style={{
                                    width: 12, height: 12, borderRadius: 2,
                                    background: day.inRange ? heatColor(day.h) : 'transparent',
                                    border: day.ds === todayStr() ? '1px solid #6366f1' : 'none',
                                    cursor: day.h ? 'pointer' : 'default', transition: 'transform 0.1s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                            ))}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: 6, justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.62rem', color: '#475569' }}>Less</span>
                    {['rgba(99,102,241,0.06)', '#c7d2fe33', '#a5b4fc', '#818cf8', '#6366f1'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />)}
                    <span style={{ fontSize: '0.62rem', color: '#475569' }}>More</span>
                </div>
            </div>

            {/* Weekly chart */}
            <div className="glass-card" style={{ padding: '1.1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.6rem' }}>📊 Weekly Hours</p>
                <Bar data={{ labels: weekLabels, datasets: [{ data: weekHours, backgroundColor: 'rgba(99,102,241,0.7)', borderColor: '#6366f1', borderWidth: 2, borderRadius: 5 }] }}
                    options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(99,102,241,0.06)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }}
                    height={80} />
            </div>

            {/* Entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {loading ? <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                    : filtered.length === 0 ? (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '2rem', marginBottom: 8 }}>{activeSection !== 'All' ? SECTION_ICONS[activeSection] : '📖'}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {activeSection !== 'All' ? `No ${activeSection} entries yet.` : 'No journal entries yet. Start logging!'}
                            </p>
                        </div>
                    ) : filtered.map(entry => {
                        const col = SECTION_COLORS[entry.section] || '#6366f1';
                        return (
                            <div key={entry._id} className="glass-card fade-in" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem', borderLeft: `3px solid ${col}` }}>
                                <div style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: 2 }}>{entry.mood}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.55rem', background: `${col}22`, color: col, borderRadius: 12, border: `1px solid ${col}33` }}>
                                            {SECTION_ICONS[entry.section]} {entry.section}
                                        </span>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{fmt(entry.date)}</span>
                                        <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, padding: '0.1rem 0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: 10 }}>
                                            <Clock size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />{entry.hoursStudied}h
                                        </span>
                                        {entry.subjects?.map(s => (
                                            <span key={s} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 8, border: '1px solid rgba(16,185,129,0.2)' }}>{s}</span>
                                        ))}
                                    </div>
                                    {entry.topics && <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📝 {entry.topics}</p>}
                                    {entry.notes && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, lineHeight: 1.5 }}>{entry.notes}</p>}
                                </div>
                                <button onClick={() => deleteEntry(entry._id)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', flexShrink: 0 }}>
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
            </div>

            {/* Log Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 500, padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>📖 Log Study Session</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={saveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {/* Section picker */}
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Section</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {SECTIONS.map(s => {
                                        const col = SECTION_COLORS[s];
                                        return (
                                            <button key={s} type="button" onClick={() => setForm({ ...form, section: s })} style={{
                                                padding: '0.3rem 0.65rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600,
                                                background: form.section === s ? `${col}22` : 'rgba(15,15,26,0.5)',
                                                border: `1.5px solid ${form.section === s ? col : 'rgba(99,102,241,0.1)'}`,
                                                color: form.section === s ? col : '#64748b'
                                            }}>{SECTION_ICONS[s]} {s}</button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="dashboard-grid" style={{ gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Date</label>
                                    <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} max={todayStr()} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Hours</label>
                                    <input type="number" className="input" min={0} max={24} step={0.5} value={form.hoursStudied} onChange={e => setForm({ ...form, hoursStudied: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Subjects (comma-separated)</label>
                                <input className="input" placeholder="e.g. DSA, DBMS, OS" value={form.subjects} onChange={e => setForm({ ...form, subjects: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Topics Covered</label>
                                <input className="input" placeholder="e.g. Binary Trees, SQL Joins" value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Mood</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {MOODS.map(m => (
                                        <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })} title={MOOD_LABELS[m]} style={{
                                            flex: 1, padding: '0.45rem', borderRadius: 8, fontSize: '1.3rem',
                                            background: form.mood === m ? 'rgba(99,102,241,0.15)' : 'rgba(15,15,26,0.5)',
                                            border: `1.5px solid ${form.mood === m ? '#6366f1' : 'transparent'}`,
                                            cursor: 'pointer'
                                        }}>{m}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Notes</label>
                                <textarea className="input" rows={3} placeholder="What did you learn? Reflections..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Save size={14} /> {saving ? 'Saving...' : 'Save Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyJournalPage;

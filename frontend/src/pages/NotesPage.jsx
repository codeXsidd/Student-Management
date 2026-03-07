import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Pin, X } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const NOTE_COLORS = [
    { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)', text: '#818cf8', value: '#6366f1' },
    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', value: '#10b981' },
    { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', value: '#f59e0b' },
    { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171', value: '#ef4444' },
    { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.3)', text: '#a78bfa', value: '#8b5cf6' },
    { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#f472b6', value: '#ec4899' },
    { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', text: '#2dd4bf', value: '#14b8a6' },
    { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c', value: '#f97316' },
];

const getColorStyle = (val) => NOTE_COLORS.find(c => c.value === val) || NOTE_COLORS[0];

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState('#6366f1');
    const [saving, setSaving] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try { const res = await API.get('/notes'); setNotes(res.data); }
            catch { toast.error('Failed to load notes'); }
            setLoading(false);
        };
        fetch();
    }, []);

    const addNote = async (e) => {
        e.preventDefault();
        if (!content.trim()) { toast.error('Enter some content'); return; }
        setSaving(true);
        try {
            const res = await API.post('/notes', { content: content.trim(), color: selectedColor });
            setNotes([res.data, ...notes]);
            setContent('');
            setShowForm(false);
            toast.success('Note added! 📌');
        } catch { toast.error('Failed'); }
        setSaving(false);
    };

    const saveEdit = async (id) => {
        if (!editContent.trim()) return;
        try {
            const res = await API.put(`/notes/${id}`, { content: editContent.trim() });
            setNotes(notes.map(n => n._id === id ? res.data : n));
            setEditId(null);
            toast.success('Saved!');
        } catch { toast.error('Failed'); }
    };

    const togglePin = async (note) => {
        try {
            const res = await API.put(`/notes/${note._id}`, { pinned: !note.pinned });
            setNotes(prev => {
                const updated = prev.map(n => n._id === note._id ? res.data : n);
                return [...updated.filter(n => n.pinned), ...updated.filter(n => !n.pinned)];
            });
        } catch { toast.error('Failed'); }
    };

    const deleteNote = async (id) => {
        try {
            await API.delete(`/notes/${id}`);
            setNotes(notes.filter(n => n._id !== id));
            toast.success('Note deleted');
        } catch { toast.error('Failed'); }
    };

    const pinned = notes.filter(n => n.pinned);
    const unpinned = notes.filter(n => !n.pinned);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
                    <StickyNote size={26} color="#f59e0b" /> Notes Wall
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({notes.length} notes)</span>
                </h2>
                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> New Note
                </button>
            </div>

            {/* Quick add bar */}
            {!showForm && (
                <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'text', border: '1px dashed rgba(99,102,241,0.25)' }}
                    onClick={() => setShowForm(true)}>
                    <Plus size={16} color="#64748b" />
                    <span style={{ color: '#64748b', fontSize: '0.88rem' }}>Type a quick note...</span>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : notes.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 12 }}>📌</p>
                    <p style={{ color: 'var(--text-muted)' }}>No notes yet. Create your first sticky note!</p>
                </div>
            ) : (
                <>
                    {/* Pinned */}
                    {pinned.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>
                                📌 Pinned
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                {pinned.map(note => <NoteCard key={note._id} note={note} editId={editId} editContent={editContent} setEditId={setEditId} setEditContent={setEditContent} saveEdit={saveEdit} togglePin={togglePin} deleteNote={deleteNote} />)}
                            </div>
                        </div>
                    )}

                    {/* Unpinned */}
                    {unpinned.length > 0 && (
                        <div>
                            {pinned.length > 0 && <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' }}>Other Notes</p>}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
                                {unpinned.map(note => <NoteCard key={note._id} note={note} editId={editId} editContent={editContent} setEditId={setEditId} setEditContent={setEditContent} saveEdit={saveEdit} togglePin={togglePin} deleteNote={deleteNote} />)}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add Note Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 440, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>📌 New Note</h3>
                            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea className="input" rows={5} placeholder="Write your note here..." value={content} onChange={e => setContent(e.target.value)}
                                autoFocus style={{ resize: 'vertical', lineHeight: 1.6 }} />
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>Note Color</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {NOTE_COLORS.map(c => (
                                        <button key={c.value} type="button" onClick={() => setSelectedColor(c.value)} style={{
                                            width: 28, height: 28, borderRadius: '50%', background: c.value,
                                            border: selectedColor === c.value ? '3px solid white' : '3px solid transparent',
                                            outline: selectedColor === c.value ? `2px solid ${c.value}` : 'none',
                                            cursor: 'pointer', transition: 'all 0.15s'
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Adding...' : 'Add Note'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const NoteCard = ({ note, editId, editContent, setEditId, setEditContent, saveEdit, togglePin, deleteNote }) => {
    const cs = getColorStyle(note.color);
    const isEditing = editId === note._id;
    return (
        <div className="fade-in" style={{
            background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 12,
            padding: '1rem', position: 'relative', minHeight: 120,
            transition: 'transform 0.15s, box-shadow 0.15s'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${note.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>

            {/* Top actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <button onClick={() => togglePin(note)} title={note.pinned ? 'Unpin' : 'Pin'} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? cs.text : '#64748b', fontSize: '0.9rem', padding: 0
                }}>
                    <Pin size={14} fill={note.pinned ? cs.text : 'none'} />
                </button>
                <button onClick={() => deleteNote(note._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    <Trash2 size={13} />
                </button>
            </div>

            {/* Content */}
            {isEditing ? (
                <div>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                        autoFocus rows={4} style={{
                            width: '100%', background: 'transparent', border: 'none', outline: '1px solid ' + cs.border,
                            borderRadius: 6, color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.6, padding: '0.4rem', resize: 'none', fontFamily: 'Inter, sans-serif'
                        }} />
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                        <button onClick={() => setEditId(null)} style={{ flex: 1, padding: '0.3rem', borderRadius: 6, background: 'rgba(99,102,241,0.1)', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.72rem' }}>Cancel</button>
                        <button onClick={() => saveEdit(note._id)} style={{ flex: 1, padding: '0.3rem', borderRadius: 6, background: cs.value, border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>Save</button>
                    </div>
                </div>
            ) : (
                <p onClick={() => { setEditId(note._id); setEditContent(note.content); }} style={{
                    fontSize: '0.83rem', color: '#e2e8f0', lineHeight: 1.6, cursor: 'text',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>{note.content}</p>
            )}

            {/* Date */}
            <p style={{ fontSize: '0.62rem', color: '#475569', marginTop: 8, textAlign: 'right' }}>
                {new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
        </div>
    );
};

export default NotesPage;

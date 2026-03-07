import React, { useState, useEffect } from 'react';
import { Code, Plus, Trash2, X, Github, ExternalLink, Star, Tag } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const PROFICIENCY = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const PROF_COLORS = ['', '#64748b', '#f59e0b', '#6366f1', '#8b5cf6', '#10b981'];
const CATEGORIES = ['Language', 'Framework', 'Tool', 'Database', 'Other'];
const STATUSES = ['In Progress', 'Completed', 'Paused'];
const STATUS_COLORS = { 'In Progress': '#6366f1', 'Completed': '#10b981', 'Paused': '#f59e0b' };

const PortfolioPage = () => {
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('projects');
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showSkillForm, setShowSkillForm] = useState(false);
    const [pForm, setPForm] = useState({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', status: 'In Progress' });
    const [sForm, setSForm] = useState({ name: '', category: 'Language', proficiency: 3 });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [pr, sk] = await Promise.all([API.get('/portfolio/projects'), API.get('/portfolio/skills')]);
                setProjects(pr.data);
                setSkills(sk.data);
            } catch { toast.error('Failed to load'); }
            setLoading(false);
        };
        load();
    }, []);

    const saveProject = async (e) => {
        e.preventDefault();
        if (!pForm.title.trim()) { toast.error('Title required'); return; }
        setSaving(true);
        try {
            const techStack = pForm.techStack.split(',').map(s => s.trim()).filter(Boolean);
            const res = await API.post('/portfolio/projects', { ...pForm, techStack });
            setProjects([res.data, ...projects]);
            setShowProjectForm(false);
            setPForm({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', status: 'In Progress' });
            toast.success('Project added! 🚀');
        } catch { toast.error('Failed'); }
        setSaving(false);
    };

    const saveSkill = async (e) => {
        e.preventDefault();
        if (!sForm.name.trim()) { toast.error('Skill name required'); return; }
        setSaving(true);
        try {
            const res = await API.post('/portfolio/skills', sForm);
            setSkills([...skills, res.data].sort((a, b) => a.category.localeCompare(b.category)));
            setShowSkillForm(false);
            setSForm({ name: '', category: 'Language', proficiency: 3 });
            toast.success('Skill added!');
        } catch { toast.error('Failed'); }
        setSaving(false);
    };

    const deleteProject = async (id) => {
        try { await API.delete(`/portfolio/projects/${id}`); setProjects(projects.filter(p => p._id !== id)); toast.success('Deleted'); }
        catch { toast.error('Failed'); }
    };

    const deleteSkill = async (id) => {
        try { await API.delete(`/portfolio/skills/${id}`); setSkills(skills.filter(s => s._id !== id)); toast.success('Deleted'); }
        catch { toast.error('Failed'); }
    };

    // Group skills by category
    const groupedSkills = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = skills.filter(s => s.category === cat);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
                    <Code size={26} color="#6366f1" /> Skill & Project Portfolio
                </h2>
                <button
                    className="btn-primary"
                    onClick={() => tab === 'projects' ? setShowProjectForm(true) : setShowSkillForm(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> Add {tab === 'projects' ? 'Project' : 'Skill'}
                </button>
            </div>

            {/* Stats bar */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Projects', value: projects.length, color: '#6366f1' },
                    { label: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: '#10b981' },
                    { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length, color: '#f59e0b' },
                    { label: 'Skills', value: skills.length, color: '#8b5cf6' }
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {['projects', 'skills'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        padding: '0.5rem 1.25rem', borderRadius: 25, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        background: tab === t ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.1)',
                        border: tab === t ? 'none' : '1px solid rgba(99,102,241,0.2)',
                        color: tab === t ? 'white' : '#94a3b8', textTransform: 'capitalize', transition: 'all 0.2s'
                    }}>{t === 'projects' ? `🚀 Projects (${projects.length})` : `⚡ Skills (${skills.length})`}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : tab === 'projects' ? (
                /* Projects grid */
                projects.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚀</p>
                        <p style={{ color: 'var(--text-muted)' }}>No projects yet. Add your first project!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {projects.map(p => (
                            <div key={p._id} className="glass-card fade-in" style={{ padding: '1.25rem', borderTop: `3px solid ${STATUS_COLORS[p.status]}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.98rem', flex: 1 }}>{p.title}</h3>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 12, background: `${STATUS_COLORS[p.status]}22`, color: STATUS_COLORS[p.status], whiteSpace: 'nowrap', marginLeft: 6 }}>
                                        {p.status}
                                    </span>
                                </div>
                                {p.description && <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.5 }}>{p.description}</p>}
                                {p.techStack?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                                        {p.techStack.map(t => (
                                            <span key={t} style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem', background: 'rgba(99,102,241,0.12)', color: '#818cf8', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)' }}>
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#818cf8', textDecoration: 'none', padding: '0.3rem 0.6rem', background: 'rgba(99,102,241,0.1)', borderRadius: 7 }}><Github size={12} /> GitHub</a>}
                                    {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#10b981', textDecoration: 'none', padding: '0.3rem 0.6rem', background: 'rgba(16,185,129,0.1)', borderRadius: 7 }}><ExternalLink size={12} /> Live</a>}
                                    <button onClick={() => deleteProject(p._id)} className="btn-danger" style={{ padding: '0.3rem 0.5rem', marginLeft: 'auto' }}><Trash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* Skills view */
                skills.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚡</p>
                        <p style={{ color: 'var(--text-muted)' }}>No skills yet. Add your first skill!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {CATEGORIES.filter(c => groupedSkills[c]?.length > 0).map(cat => (
                            <div key={cat} className="glass-card" style={{ padding: '1.25rem' }}>
                                <h3 style={{ fontWeight: 700, fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {cat === 'Language' ? '💻' : cat === 'Framework' ? '🧩' : cat === 'Tool' ? '🔧' : cat === 'Database' ? '🗄️' : '⭐'} {cat}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {groupedSkills[cat].map(skill => (
                                        <div key={skill._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ minWidth: 120, fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{skill.name}</div>
                                            {/* Progress bar */}
                                            <div style={{ flex: 1, height: 8, background: 'rgba(99,102,241,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                                                <div style={{
                                                    height: '100%', width: `${(skill.proficiency / 5) * 100}%`,
                                                    background: `linear-gradient(90deg, ${PROF_COLORS[skill.proficiency]}, ${PROF_COLORS[skill.proficiency]}bb)`,
                                                    borderRadius: 4, transition: 'width 0.6s ease'
                                                }} />
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: PROF_COLORS[skill.proficiency], minWidth: 75 }}>
                                                {PROFICIENCY[skill.proficiency]}
                                            </span>
                                            <button onClick={() => deleteSkill(skill._id)} className="btn-danger" style={{ padding: '0.25rem 0.4rem' }}><Trash2 size={11} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Project Form Modal */}
            {showProjectForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowProjectForm(false)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 480, padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>🚀 Add Project</h3>
                            <button onClick={() => setShowProjectForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={saveProject} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Project Title *</label>
                                <input className="input" placeholder="e.g. Student Management System" value={pForm.title} onChange={e => setPForm({ ...pForm, title: e.target.value })} autoFocus />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Description</label>
                                <textarea className="input" rows={2} placeholder="What does this project do?" value={pForm.description} onChange={e => setPForm({ ...pForm, description: e.target.value })} style={{ resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Tech Stack (comma-separated)</label>
                                <input className="input" placeholder="e.g. React, Node.js, MongoDB" value={pForm.techStack} onChange={e => setPForm({ ...pForm, techStack: e.target.value })} />
                            </div>
                            <div className="dashboard-grid" style={{ gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>GitHub URL</label>
                                    <input className="input" placeholder="https://github.com/..." value={pForm.githubUrl} onChange={e => setPForm({ ...pForm, githubUrl: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Live URL</label>
                                    <input className="input" placeholder="https://..." value={pForm.liveUrl} onChange={e => setPForm({ ...pForm, liveUrl: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Status</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {STATUSES.map(s => (
                                        <button key={s} type="button" onClick={() => setPForm({ ...pForm, status: s })} style={{
                                            flex: 1, padding: '0.4rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                            background: pForm.status === s ? `${STATUS_COLORS[s]}22` : 'rgba(99,102,241,0.05)',
                                            border: `1.5px solid ${pForm.status === s ? STATUS_COLORS[s] : 'transparent'}`,
                                            color: pForm.status === s ? STATUS_COLORS[s] : '#64748b'
                                        }}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowProjectForm(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Adding...' : 'Add Project'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Skill Form Modal */}
            {showSkillForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowSkillForm(false)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 400, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>⚡ Add Skill</h3>
                            <button onClick={() => setShowSkillForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <form onSubmit={saveSkill} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Skill Name *</label>
                                <input className="input" placeholder="e.g. Python" value={sForm.name} onChange={e => setSForm({ ...sForm, name: e.target.value })} autoFocus />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 5 }}>Category</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {CATEGORIES.map(c => (
                                        <button key={c} type="button" onClick={() => setSForm({ ...sForm, category: c })} style={{
                                            padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                                            background: sForm.category === c ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.05)',
                                            border: `1.5px solid ${sForm.category === c ? '#6366f1' : 'transparent'}`,
                                            color: sForm.category === c ? '#818cf8' : '#64748b'
                                        }}>{c}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
                                    Proficiency — <span style={{ color: PROF_COLORS[sForm.proficiency] }}>{PROFICIENCY[sForm.proficiency]}</span>
                                </label>
                                <input type="range" min={1} max={5} value={sForm.proficiency} onChange={e => setSForm({ ...sForm, proficiency: Number(e.target.value) })}
                                    style={{ width: '100%', accentColor: PROF_COLORS[sForm.proficiency] }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    {PROFICIENCY.slice(1).map((p, i) => (
                                        <span key={p} style={{ fontSize: '0.6rem', color: sForm.proficiency === i + 1 ? PROF_COLORS[i + 1] : '#475569', fontWeight: sForm.proficiency === i + 1 ? 700 : 400 }}>{p}</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="button" onClick={() => setShowSkillForm(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Adding...' : 'Add Skill'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;

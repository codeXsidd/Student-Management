import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { TrendingUp, Flame, CheckCircle2, Clock, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AnalyticsPage = () => {
    const [journal, setJournal] = useState([]);
    const [todos, setTodos] = useState([]);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [jRes, tRes, hRes] = await Promise.all([
                    API.get('/journal'),
                    API.get('/todos'),
                    API.get('/habits')
                ]);
                setJournal(jRes.data);
                setTodos(tRes.data);
                setHabits(hRes.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Process data
    const totalHours = journal.reduce((sum, entry) => sum + (entry.hoursStudied || 0), 0);
    const completedTasks = todos.filter(t => t.completed).length;
    const totalTasks = todos.length;

    // Streak logic
    const sortedDates = journal.map(e => e.date).sort((a, b) => b.localeCompare(a));
    let currentStreak = 0;
    let curDate = new Date().toISOString().split('T')[0];
    for (const d of sortedDates) {
        if (d === curDate) {
            currentStreak++;
            const dt = new Date(d);
            dt.setDate(dt.getDate() - 1);
            curDate = dt.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    // Heatmap (Last 30 Days)
    const last30Days = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return {
            dateStr: d.toISOString().split('T')[0],
            dayNum: d.getDate()
        };
    });

    const getIntensity = (dateStr) => {
        const jEntry = journal.find(j => j.date === dateStr);
        if (!jEntry) return 0;
        if (jEntry.hoursStudied >= 4) return 3;
        if (jEntry.hoursStudied >= 2) return 2;
        return 1;
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;

    return (
        <div className="page-container fade-in">
            <div className="section-title">
                <TrendingUp size={26} color="#10b981" /> Productivity Analytics
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '2rem', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
                <div className="glass-card fade-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Study Streak</p>
                        <p className="stat-number">{currentStreak} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days</span></p>
                    </div>
                </div>

                <div className="glass-card fade-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #6366f1', animationDelay: '0.1s' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Total Hours</p>
                        <p className="stat-number">{totalHours}</p>
                    </div>
                </div>

                <div className="glass-card fade-up" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981', animationDelay: '0.2s' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={24} color="#10b981" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Tasks Done</p>
                        <p className="stat-number">{completedTasks} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {totalTasks}</span></p>
                    </div>
                </div>
            </div>

            {/* Heatmap Section */}
            <div className="glass-card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                    <CalendarIcon size={20} color="#ec4899" /> 30-Day Activity Heatmap
                </h3>

                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.5rem',
                    background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 16
                }}>
                    {last30Days.map((day, i) => {
                        const intensity = getIntensity(day.dateStr);
                        const colors = ['rgba(255,255,255,0.05)', '#6366f1cc', '#8b5cf6', '#ec4899'];
                        return (
                            <div key={i} title={`${day.dateStr}: Intensity ${intensity}`} style={{
                                aspectRatio: '1', borderRadius: '4px', background: colors[intensity],
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', color: intensity === 0 ? 'var(--text-disabled)' : 'white',
                                fontWeight: intensity > 0 ? 800 : 500
                            }}>
                                {day.dayNum}
                            </div>
                        )
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Less <div style={{ width: 12, height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                    <div style={{ width: 12, height: 12, background: '#6366f1cc', borderRadius: 2 }} />
                    <div style={{ width: 12, height: 12, background: '#8b5cf6', borderRadius: 2 }} />
                    <div style={{ width: 12, height: 12, background: '#ec4899', borderRadius: 2 }} /> More
                </div>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link to="/journal" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={18} /> Update Study Journal
                </Link>
            </div>

        </div>
    );
};

export default AnalyticsPage;

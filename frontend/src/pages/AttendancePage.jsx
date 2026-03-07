import React, { useState, useEffect, useRef } from 'react';
import { getSubjects, getAttendance, markAttendance } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const AttendancePage = () => {
    const [subjects, setSubjects] = useState([]);
    const [selected, setSelected] = useState('');
    const [attendanceData, setAttendanceData] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [marking, setMarking] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await getSubjects();
                setSubjects(res.data);
                if (res.data.length > 0) setSelected(res.data[0]._id);
            } catch { toast.error('Failed to load subjects'); }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selected) fetchAttendance();
    }, [selected]);

    const fetchAttendance = async () => {
        try {
            const res = await getAttendance(selected);
            setAttendanceData(res.data);
        } catch { }
    };

    const handleMark = async (status) => {
        if (!selected) { toast.error('Select a subject first'); return; }
        setMarking(true);
        try {
            await markAttendance({ subjectId: selected, date, status });
            toast.success(`Marked ${status} for ${date}`);
            fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to mark attendance');
        } finally { setMarking(false); }
    };

    const getAttColor = (pct) => pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    const stats = attendanceData?.stats;
    const subjectColor = subjects.find(s => s._id === selected)?.color || '#6366f1';

    const chartData = {
        labels: ['Present', 'Absent'],
        datasets: [{
            data: [stats?.attended || 0, stats?.absent || 0],
            backgroundColor: ['#10b981', '#ef4444'],
            borderColor: ['#10b98150', '#ef444450'],
            borderWidth: 2,
            hoverOffset: 6
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { labels: { color: '#cbd5e1', font: { size: 12 } } },
            tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} classes` } }
        },
        cutout: '68%'
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="section-title">
                <Calendar size={24} color="#6366f1" />
                <span>Attendance Tracker</span>
            </div>

            <div className="dashboard-grid" style={{ gap: '1.5rem' }}>
                {/* Left: mark attendance */}
                <div>
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: '#cbd5e1' }}>Mark Attendance</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Subject</label>
                            <div style={{ position: 'relative' }}>
                                <select className="input" value={selected} onChange={e => setSelected(e.target.value)} style={{ appearance: 'none', paddingRight: '2.5rem' }}>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                                <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Date</label>
                            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button onClick={() => handleMark('present')} disabled={marking || !selected} style={{
                                padding: '0.75rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: 8, color: '#10b981', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                            >
                                <CheckCircle size={18} /> Present
                            </button>
                            <button onClick={() => handleMark('absent')} disabled={marking || !selected} style={{
                                padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                            >
                                <XCircle size={18} /> Absent
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="glass-card" style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                Stats for <span style={{ color: subjectColor }}>{attendanceData?.subject?.name}</span>
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                                {[
                                    { label: 'Present', value: stats.attended, color: '#10b981' },
                                    { label: 'Absent', value: stats.absent, color: '#ef4444' },
                                    { label: 'Total', value: stats.total, color: '#6366f1' }
                                ].map(item => (
                                    <div key={item.label} style={{ background: 'rgba(15,15,26,0.6)', borderRadius: 8, padding: '0.75rem' }}>
                                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: getAttColor(stats.percentage) }}>{stats.percentage}%</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attendance Rate</p>
                                {stats.percentage < 75 && (
                                    <p style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: 6 }}>
                                        ⚠️ Need {Math.ceil((75 * stats.total - 100 * stats.attended) / 25)} more classes to reach 75%
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: chart + records */}
                <div>
                    {stats && stats.total > 0 ? (
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Attendance Chart</h3>
                            <div style={{ maxWidth: 220, margin: '0 auto' }}>
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
                            <Calendar size={40} color="#6366f133" style={{ marginBottom: 12 }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mark attendance to see the chart</p>
                        </div>
                    )}

                    {/* Recent records */}
                    {attendanceData?.records?.length > 0 && (
                        <div className="glass-card" style={{ padding: '1.25rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Recent Records</h3>
                            <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {attendanceData.records.slice(0, 20).map(r => (
                                    <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(15,15,26,0.5)', borderRadius: 8 }}>
                                        <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        <span className={`badge ${r.status === 'present' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendancePage;

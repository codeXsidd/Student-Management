import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Moon, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { addXP } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MODES = [
    { label: 'Focus', time: 25 * 60, color: '#6366f1', icon: <BookOpen size={16} /> },
    { label: 'Short Break', time: 5 * 60, color: '#10b981', icon: <Coffee size={16} /> },
    { label: 'Long Break', time: 15 * 60, color: '#8b5cf6', icon: <Moon size={16} /> },
];

const PomodoroPage = () => {
    const [modeIdx, setModeIdx] = useState(0);
    const [seconds, setSeconds] = useState(MODES[0].time);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [totalFocus, setTotalFocus] = useState(0);
    const intervalRef = useRef(null);
    const mode = MODES[modeIdx];
    const { updateUserXP } = useAuth();

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        handleComplete();
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, modeIdx]);

    const handleComplete = () => {
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(`⏰ ${mode.label} Complete!`, {
                body: modeIdx === 0 ? 'Great work! Time for a break.' : 'Break over! Back to focus.',
                icon: '/vite.svg'
            });
        }
        // Play beep via Web Audio
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch { }

        if (modeIdx === 0) {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            setTotalFocus(t => t + MODES[0].time);

            // Gamification: 10 XP per focus session
            addXP({ xpToAdd: 10 }).then(res => {
                const { xp, level, leveledUp } = res.data;
                updateUserXP(xp, level);
                if (leveledUp) {
                    toast.success(`🎉 Level Up! You are now Level ${level}!`, { icon: '🏆' });
                } else {
                    toast.success('+10 XP for focusing!', { icon: '⚡' });
                }
            }).catch(() => { });

            // After 4 focus sessions → long break
            if (newSessions % 4 === 0) switchMode(2);
            else switchMode(1);
        } else {
            switchMode(0);
        }
    };

    const switchMode = (idx) => {
        setModeIdx(idx);
        setSeconds(MODES[idx].time);
        setRunning(false);
    };

    const reset = () => { setRunning(false); setSeconds(mode.time); };

    const requestNotification = () => {
        if (Notification.permission === 'default') Notification.requestPermission();
    };

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const progress = ((mode.time - seconds) / mode.time) * 100;
    const circumference = 2 * Math.PI * 110;

    return (
        <div className="page-container animate-slide-scale">
            <div className="section-title" style={{ justifyContent: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
                <Timer size={30} color="#6366f1" /> Pomodoro Study Timer
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {MODES.map((m, i) => (
                    <button key={i} onClick={() => switchMode(i)} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.25rem',
                        borderRadius: 30, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700,
                        background: modeIdx === i ? m.color : 'rgba(99,102,241,0.05)',
                        border: '1px solid',
                        borderColor: modeIdx === i ? 'transparent' : 'rgba(99,102,241,0.2)',
                        color: modeIdx === i ? 'white' : '#94a3b8',
                        transition: 'var(--transition)',
                        transform: modeIdx === i ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: modeIdx === i ? `0 4px 15px ${m.color}66` : 'none'
                    }}>
                        {m.icon} {m.label}
                    </button>
                ))}
            </div>

            {/* Circular Timer */}
            <div className={`glass-card ${running ? 'glow-anim' : ''}`} style={{ padding: '3.5rem 2.5rem', textAlign: 'center', marginBottom: '2rem', background: running ? 'rgba(99,102,241,0.03)' : 'var(--bg-card)' }}>
                <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 2.5rem' }}>
                    <svg width="280" height="280" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                        {/* Background circle */}
                        <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="12" />
                        {/* Progress circle */}
                        <circle cx="140" cy="140" r="120" fill="none"
                            stroke={mode.color} strokeWidth="12"
                            strokeDasharray={754}
                            strokeDashoffset={754 - (progress / 100) * 754}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${mode.color}88)` }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '4.5rem', fontWeight: 900, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums', color: mode.color, textShadow: `0 0 15px ${mode.color}44` }}>
                            {mins}:{secs}
                        </div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '1rem', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{mode.label}</p>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem' }}>
                    <button onClick={reset} className="glass-card" style={{
                        width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)',
                        background: 'rgba(99,102,241,0.05)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <RotateCcw size={22} />
                    </button>
                    <button onClick={() => { requestNotification(); setRunning(!running); }} style={{
                        width: 84, height: 84, borderRadius: '50%', border: 'none',
                        background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                        cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 32px ${mode.color}77`, transition: 'var(--transition)'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        {running ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" style={{ marginLeft: 6 }} />}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Sessions', value: sessions, color: '#6366f1' },
                    { label: 'Focus Time', value: `${Math.floor(totalFocus / 60)}m`, color: '#10b981' },
                    { label: 'Until Long Break', value: `${4 - (sessions % 4) || 4} left`, color: '#f59e0b' }
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
                💡 Tip: After every 4 focus sessions you'll get a 15-min long break automatically.
            </p>
        </div>
    );
};

export default PomodoroPage;

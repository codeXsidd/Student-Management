import React, { useState, useEffect } from 'react';
import { syncRival } from '../services/api';
import { Swords, MessageSquare, Zap, Target, User } from 'lucide-react';
import toast from 'react-hot-toast';

const RIVALS = [
    { id: "Chad (The relentless 4.0 Pre-Med)", name: "Chad", desc: "Arrogant, works incredibly fast, 4.0 GPA.", color: "#ef4444" },
    { id: "Zoe (The erratic last-minute crammer)", name: "Zoe", desc: "Starts slow, but panic-studies at lightspeed.", color: "#f59e0b" },
    { id: "StudyBot-9000", name: "Robo-Rival", desc: "Cold, calculated, perfectly efficient.", color: "#8b5cf6" }
];

const AIStudyRival = ({ userTasksCompleted = 0, totalSessionTasks = 10 }) => {
    const [activeRival, setActiveRival] = useState(null);
    const [rivalProgress, setRivalProgress] = useState(0);
    const [rivalMessage, setRivalMessage] = useState("Let's see what you've got.");
    const [isSyncing, setIsSyncing] = useState(false);

    // Sync with Rival whenever user completes a task
    useEffect(() => {
        if (!activeRival) return;
        
        let isMounted = true;
        const sync = async () => {
            setIsSyncing(true);
            try {
                const res = await syncRival({
                    rivalType: activeRival.id,
                    userTasksCompleted,
                    totalSessionTasks
                });
                if (isMounted) {
                    setRivalProgress(res.data.rivalProgress);
                    setRivalMessage(res.data.message);
                }
            } catch (err) {
                console.error("Rival sync failed");
            }
            if (isMounted) setIsSyncing(false);
        };

        sync();
        
        return () => { isMounted = false; };
    }, [userTasksCompleted, activeRival, totalSessionTasks]);

    const handleSelectRival = (rival) => {
        setActiveRival(rival);
        setRivalProgress(userTasksCompleted); // Start at the same level roughly
        setRivalMessage(`I am ${rival.name}. Prepare to be outworked.`);
    };

    const userPercentage = Math.min((userTasksCompleted / totalSessionTasks) * 100, 100);
    const rivalPercentage = Math.min((rivalProgress / totalSessionTasks) * 100, 100);

    if (!activeRival) {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(0,0,0,0))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                    <Swords size={22} color="#f43f5e" />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Summon a Study Rival</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.5 }}>
                    Studying alone is boring. Summon an AI rival to race against you today. They will dynamically speed up as you complete tasks.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    {RIVALS.map(rival => (
                        <button
                            key={rival.id}
                            onClick={() => handleSelectRival(rival)}
                            style={{
                                padding: '1rem', background: 'rgba(0,0,0,0.3)', border: `1px solid ${rival.color}40`,
                                borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = `${rival.color}15`}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                        >
                            <h4 style={{ color: rival.color, fontSize: '0.9rem', fontWeight: 800, marginBottom: 4 }}>{rival.name}</h4>
                            <p style={{ color: '#94a3b8', fontSize: '0.75rem', lineHeight: 1.4 }}>{rival.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card fade-in" style={{ padding: '1.5rem', border: `1px solid ${activeRival.color}40`, position: 'relative', overflow: 'hidden' }}>
            {/* Background Glow */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: 100, height: 100, background: activeRival.color, borderRadius: '50%', filter: 'blur(80px)', opacity: 0.15 }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Swords size={20} color={activeRival.color} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>VS {activeRival.name}</h3>
                </div>
                <button 
                    onClick={() => setActiveRival(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Yield Match
                </button>
            </div>

            {/* AI Trash Talk Bubble */}
            <div style={{ 
                background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', 
                borderLeft: `3px solid ${activeRival.color}`, display: 'flex', gap: 12, alignItems: 'flex-start' 
            }}>
                <MessageSquare size={16} color={activeRival.color} style={{ flexShrink: 0, marginTop: 2, opacity: isSyncing ? 0.3 : 1 }} />
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.5, opacity: isSyncing ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                    "{rivalMessage}"
                </p>
            </div>

            {/* Progress Race Track */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Your Track */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={14} color="#10b981" /> You
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800 }}>{userTasksCompleted}/{totalSessionTasks}</span>
                    </div>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ 
                            height: '100%', width: `${userPercentage}%`, background: '#10b981', 
                            borderRadius: 6, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                        }} />
                    </div>
                </div>

                {/* Rival Track */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: activeRival.color, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={14} color={activeRival.color} /> {activeRival.name}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: activeRival.color, fontWeight: 800 }}>{rivalProgress}/{totalSessionTasks}</span>
                    </div>
                    <div style={{ height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ 
                            height: '100%', width: `${rivalPercentage}%`, background: activeRival.color, 
                            borderRadius: 6, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)', opacity: 0.8
                        }} />
                    </div>
                </div>

            </div>
            
            {userTasksCompleted > rivalProgress && (
                <div className="fade-up" style={{ marginTop: '1rem', textAlign: 'center', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                    🔥 You are currently in the lead! Keep pushing!
                </div>
            )}
        </div>
    );
};

export default AIStudyRival;

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';
import TaskMatchmaker from '../components/TaskMatchmaker';
import DopamineVault from '../components/DopamineVault';
import ProcrastinationSimulator from '../components/ProcrastinationSimulator';

const AiArsenalPage = () => {
    const [allTodos, setAllTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get('/todos');
                setAllTodos(res.data || []);
            } catch {
                toast.error('Failed to load tasks for context');
            }
            setLoading(false);
        };
        fetch();
    }, []);

    const isCompletedToday = (t) => {
        if (!t.completed || !t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        const today = new Date();
        return compDate.getDate() === today.getDate() &&
            compDate.getMonth() === today.getMonth() &&
            compDate.getFullYear() === today.getFullYear();
    };

    const completedToday = allTodos.filter(t => isCompletedToday(t));
    const potentialTasks = allTodos.filter(t => !t.dayPlan && !t.completed);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}><Sparkles size={30} className="float" color="#a855f7" /></div>;
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <div style={{ padding: 10, background: 'linear-gradient(135deg, #c084fc, #ec4899)', borderRadius: 12 }}>
                    <Sparkles size={24} color="white" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(to right, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    AI Productivity Arsenal
                </h1>
            </div>
            
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '3rem', maxWidth: '800px', lineHeight: 1.6 }}>
                Leverage your digital assistants to overcome procrastination, unlock dopamine, and find your next best task. 
                These specialized AI tools analyze your current backlog to give you hyper-personalized productivity boosts.
            </p>
            
            {/* 3-Column AI Tools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                <TaskMatchmaker />
                <DopamineVault tasksCompletedCount={completedToday.length} />
                <ProcrastinationSimulator defaultTask={potentialTasks.length > 0 ? potentialTasks[0].title : ''} />
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

export default AiArsenalPage;

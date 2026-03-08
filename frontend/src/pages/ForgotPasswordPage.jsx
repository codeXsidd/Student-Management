import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Mail, ArrowLeft, Copy, CheckCircle, KeyRound } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [fallbackLink, setFallbackLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${baseURL}/auth/forgot-password`, { email });
            setSuccessMsg(res.data.message || 'If your email is registered, a link has been sent.');
            if (res.data.fallbackLink) setFallbackLink(res.data.fallbackLink);
            if (res.data.resetLink) setFallbackLink(res.data.resetLink);
            toast.success('Generated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-dark)', padding: '1.5rem',
            backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.06) 0%, transparent 50%)'
        }}>
            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 440, padding: '2.5rem' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                    }}>
                        <KeyRound size={28} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Forgot Password?</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        Enter your email and we'll generate a reset link
                    </p>
                </div>

                {!successMsg ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="email" placeholder="you@example.com"
                                    className="input" style={{ paddingLeft: '2.5rem' }}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? 'Sending email...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="fade-in">
                        <div style={{
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                            borderRadius: 10, padding: '1.5rem', marginBottom: '1rem', textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                                <CheckCircle size={24} color="#10b981" />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981', display: 'block', marginBottom: 8 }}>Done!</span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {successMsg}
                            </p>
                            {fallbackLink && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(99,102,241,0.1)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#e2e8f0', marginBottom: 8, fontWeight: 600 }}>Click here to reset securely:</p>
                                    <a href={fallbackLink} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: '#818cf8', fontWeight: 700 }}>{fallbackLink}</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        color: '#818cf8', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem'
                    }}>
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

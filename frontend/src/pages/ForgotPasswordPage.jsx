import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BookOpen, Mail, ArrowLeft, Copy, CheckCircle, KeyRound } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetUrl, setResetUrl] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${baseURL}/auth/forgot-password`, { email });
            if (res.data.resetUrl) {
                setResetUrl(res.data.resetUrl);
                toast.success('Reset link generated!');
            } else {
                toast.success(res.data.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(resetUrl);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
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

                {!resetUrl ? (
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
                            {loading ? 'Generating link...' : 'Generate Reset Link'}
                        </button>
                    </form>
                ) : (
                    /* Reset link display */
                    <div className="fade-in">
                        <div style={{
                            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                            borderRadius: 10, padding: '1rem', marginBottom: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <CheckCircle size={16} color="#10b981" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>Reset link generated!</span>
                            </div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                                Copy the link below and open it in your browser to reset your password. Link expires in <strong style={{ color: '#f59e0b' }}>1 hour</strong>.
                            </p>
                            <div style={{
                                background: 'rgba(15,15,26,0.8)', borderRadius: 8, padding: '0.6rem 0.75rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                                border: '1px solid rgba(99,102,241,0.15)', wordBreak: 'break-all'
                            }}>
                                <span style={{ fontSize: '0.72rem', color: '#818cf8', flex: 1 }}>{resetUrl}</span>
                                <button onClick={handleCopy} style={{
                                    background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)',
                                    border: 'none', borderRadius: 6, padding: '0.3rem 0.5rem',
                                    cursor: 'pointer', color: copied ? '#10b981' : '#818cf8', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600
                                }}>
                                    {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => window.open(resetUrl, '_self')}
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            Open Reset Link →
                        </button>
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

import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pwdRegex.test(password)) {
            return toast.error('Password must be at least 8 characters, include an uppercase letter, a number, and a special character');
        }
        if (password !== confirm) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);
        try {
            const res = await axios.post(`${baseURL}/auth/reset-password/${token}`, { password });
            toast.success(res.data.message || 'Password reset successfully!');
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
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
            <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56,
                        background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', boxShadow: `0 8px 24px ${success ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`
                    }}>
                        {success ? <ShieldCheck size={28} color="white" /> : <Lock size={28} color="white" />}
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
                        {success ? 'Password Reset!' : 'Set New Password'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {success ? 'Redirecting you to login...' : 'Choose a strong new password'}
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="min. 8 characters + mixed casing"
                                    className="input"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0
                                }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Password strength bar */}
                            {password.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ height: 4, background: 'rgba(99,102,241,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: 2, transition: 'width 0.3s',
                                            width: password.length >= 12 ? '100%' : password.length >= 10 ? '75%' : password.length >= 8 ? '50%' : '10%',
                                            background: password.length >= 12 ? '#06b6d4' : password.length >= 10 ? '#10b981' : password.length >= 8 ? '#f59e0b' : '#ef4444'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 3 }}>
                                        {password.length >= 12 ? '🤩 Very Strong' : password.length >= 10 ? '💪 Strong' : password.length >= 8 ? '😐 Medium' : '❌ Too short/Weak'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#cbd5e1' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="repeat your password"
                                    className="input"
                                    style={{ paddingLeft: '2.5rem', borderColor: confirm && confirm !== password ? 'rgba(239,68,68,0.5)' : undefined }}
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                />
                            </div>
                            {confirm && confirm !== password && (
                                <p style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: 4 }}>Passwords don't match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || (confirm && confirm !== password)}
                            style={{ marginTop: 8, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        >
                            {loading ? 'Resetting...' : <><ShieldCheck size={16} /> Reset Password</>}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎉</div>
                        <p style={{ color: '#10b981', fontWeight: 600 }}>Password changed successfully!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Taking you to login...</p>
                    </div>
                )}

                {!success && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            color: '#818cf8', fontWeight: 600, textDecoration: 'none', fontSize: '0.85rem'
                        }}>
                            <ArrowLeft size={14} /> Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;

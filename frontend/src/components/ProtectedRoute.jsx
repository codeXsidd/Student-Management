import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-dark)' }}>
                <div className="text-center">
                    <div style={{
                        width: 48, height: 48, border: '3px solid rgba(99,102,241,0.2)',
                        borderTop: '3px solid #6366f1', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto'
                    }} />
                    <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: '0.9rem' }}>Loading...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

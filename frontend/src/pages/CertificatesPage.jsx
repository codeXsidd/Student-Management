import React, { useState, useEffect, useRef } from 'react';
import { Award, Upload, Trash2, Download, FileText, X, Plus } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const CertificatesPage = () => {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const fetchCerts = async () => {
        try {
            const res = await API.get('/certificates');
            setCerts(res.data);
        } catch { toast.error('Failed to load certificates'); }
        setLoading(false);
    };

    useEffect(() => { fetchCerts(); }, []);

    const handleFileChange = (f) => {
        if (!f) return;
        if (f.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
        if (f.size > 2 * 1024 * 1024) { toast.error('File is too large! Maximum size is 2MB'); return; }
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title.trim() || !file) { toast.error('Please add a title and select a PDF'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('file', file);
            const res = await API.post('/certificates', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCerts([res.data, ...certs]);
            setTitle(''); setFile(null); setShowForm(false);
            toast.success(`"${res.data.title}" uploaded! 🎓`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    const handleDownload = async (cert) => {
        try {
            const res = await API.get(`/certificates/${cert._id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = cert.originalName; a.click();
            window.URL.revokeObjectURL(url);
        } catch { toast.error('Download failed'); }
    };

    const handleDelete = async (id, name) => {
        try {
            await API.delete(`/certificates/${id}`);
            setCerts(certs.filter(c => c._id !== id));
            toast.success(`"${name}" deleted`);
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <Award size={24} color="#6366f1" /> Certificate Vault
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> Upload Certificate
                </button>
            </div>

            {/* Upload Form */}
            {showForm && (
                <div className="glass-card fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <form onSubmit={handleUpload}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Certificate Title</label>
                            <input className="input" placeholder="e.g. Python Basics Certificate" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current.click()}
                            style={{
                                border: `2px dashed ${dragOver ? '#6366f1' : file ? '#10b981' : 'rgba(99,102,241,0.3)'}`,
                                borderRadius: 10, padding: '2rem', textAlign: 'center', cursor: 'pointer',
                                background: dragOver ? 'rgba(99,102,241,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'transparent',
                                transition: 'all 0.2s', marginBottom: '1rem'
                            }}>
                            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files[0])} />
                            {file ? (
                                <div>
                                    <FileText size={32} color="#10b981" style={{ marginBottom: 8 }} />
                                    <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatSize(file.size)} • PDF</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={32} color="#6366f1" style={{ marginBottom: 8 }} />
                                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>Drop your PDF here or click to browse</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>PDF only • Max 2MB</p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => { setShowForm(false); setFile(null); setTitle(''); }}
                                style={{ padding: '0.55rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={uploading || !file || !title}>
                                {uploading ? 'Uploading...' : 'Upload Certificate'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Certificates Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : certs.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Award size={52} color="#6366f133" style={{ marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No certificates yet. Upload your first achievement!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {certs.map(cert => (
                        <div key={cert._id} className="glass-card fade-in" style={{ padding: '1.25rem', borderTop: '3px solid #6366f1' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ width: 40, height: 40, background: 'rgba(99,102,241,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                                        <FileText size={20} color="#818cf8" />
                                    </div>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, lineHeight: 1.3 }}>{cert.title}</h3>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{cert.originalName}</p>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        {formatSize(cert.fileSize)} • {new Date(cert.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button onClick={() => handleDownload(cert)} className="btn-success" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <Download size={14} /> Download
                                </button>
                                <button onClick={() => handleDelete(cert._id, cert.title)} className="btn-danger" style={{ padding: '0.4rem 0.65rem' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CertificatesPage;

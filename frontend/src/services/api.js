import axios from 'axios';

// Use environment variable for production, default to localhost for development
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token from localStorage on every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const addXP = (data) => API.post('/auth/add-xp', data);

// Subjects
export const getSubjects = () => API.get('/subjects');
export const addSubject = (data) => API.post('/subjects', data);
export const deleteSubject = (id) => API.delete(`/subjects/${id}`);

// Assignments
export const getAssignments = (params) => API.get('/assignments', { params });
export const getUpcoming = () => API.get('/assignments/upcoming');
export const addAssignment = (data) => API.post('/assignments', data);
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Certificates
export const getCertificates = () => API.get('/certificates');
export const uploadCertificate = (formData) => API.post('/certificates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const downloadCertificate = (id) => API.get(`/certificates/${id}/download`, { responseType: 'blob' });
export const deleteCertificate = (id) => API.delete(`/certificates/${id}`);

// Notes
export const getNotes = () => API.get('/notes');
export const addNote = (data) => API.post('/notes', data);
export const updateNote = (id, data) => API.put(`/notes/${id}`, data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);

// Habits
export const getHabits = () => API.get('/habits');
export const createHabit = (data) => API.post('/habits', data);
export const updateHabit = (id, data) => API.put(`/habits/${id}`, data);
export const deleteHabit = (id) => API.delete(`/habits/${id}`);
export const toggleHabit = (id, date) => API.post(`/habits/${id}/toggle`, { date });

// AI Productivity (Puter.js Full Free Mode)
const callPuterAI = async (prompt) => {
    if (window.puter && window.puter.ai) {
        const resp = await window.puter.ai.chat(prompt);
        return resp.toString();
    }
    throw new Error("Puter not loaded");
};

export const breakDownTask = async (data) => {
    try {
        const prompt = `Break down this student goal into 3-5 subtasks with durations:\n"${data.taskTitle}"\nReturn ONLY a JSON array like: [{"title":"Step", "duration":"30m"}]`;
        const res = await callPuterAI(prompt);
        const json = JSON.parse(res.replace(/```json/g, '').replace(/```/g, '').trim());
        return { data: json };
    } catch { return API.post('/ai/breakdown', data); }
};

export const generateFlashcards = async (data) => {
    try {
        const prompt = `Turn these study notes into 2 to 4 interactive flashcards:\n"${data.noteContent}"\nReturn ONLY a JSON array: [{"q":"What is...", "a":"Answer"}]`;
        const res = await callPuterAI(prompt);
        const json = JSON.parse(res.replace(/```json/g, '').replace(/```/g, '').trim());
        return { data: json };
    } catch { return API.post('/ai/flashcards', data); }
};

export const aiChat = async (data) => {
    try {
        const prompt = `Student says: "${data.message}"\nContext: ${data.context || 'General study help'}\n\nYou are a friendly AI tutor in a Deep Focus Room. Explains things simply.`;
        const res = await callPuterAI(prompt);
        return { data: { reply: res } };
    } catch { return API.post('/ai/chat', data); }
};

export const summarizeText = async (data) => {
    try {
        const prompt = `Summarize this text into 3-5 bullet points:\n"${data.text}"`;
        const res = await callPuterAI(prompt);
        return { data: { summary: res } };
    } catch { return API.post('/ai/summarize', data); }
};

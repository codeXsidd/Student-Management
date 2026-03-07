const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    section: {
        type: String,
        enum: ['Study Session', 'Lecture Notes', 'Exam Prep', 'Lab Work', 'Project Work', 'Reflection', 'Personal'],
        default: 'Study Session'
    },
    subjects: [{ type: String }],
    hoursStudied: { type: Number, default: 0, min: 0, max: 24 },
    mood: { type: String, enum: ['😴', '😐', '⚡', '🔥'], default: '😐' },
    notes: { type: String, default: '', maxlength: 2000 },
    topics: { type: String, default: '' }
}, { timestamps: true });

// Allow multiple entries per day (different sections)
journalSchema.index({ user: 1, date: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('JournalEntry', journalSchema);

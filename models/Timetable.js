const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    period: { type: Number, required: true, min: 1, max: 9 },
    subject: { type: String, required: true, trim: true },
    teacher: { type: String, default: '', trim: true },
    room: { type: String, default: '', trim: true },
    color: { type: String, default: '#6366f1' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' }
}, { timestamps: true });

timetableSchema.index({ user: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);

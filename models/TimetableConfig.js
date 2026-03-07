const mongoose = require('mongoose');

const periodDefSchema = new mongoose.Schema({
    number: { type: Number, required: true },
    label: { type: String, default: '' },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' }
}, { _id: false });

const timetableConfigSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalPeriods: { type: Number, default: 8, min: 1, max: 15 },
    periods: [periodDefSchema]
}, { timestamps: true });

module.exports = mongoose.model('TimetableConfig', timetableConfigSchema);

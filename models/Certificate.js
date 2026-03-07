const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    fileSize: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);

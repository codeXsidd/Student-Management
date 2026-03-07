const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true, maxlength: 500 },
    color: { type: String, default: '#6366f1' },
    pinned: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);

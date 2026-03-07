const mongoose = require('mongoose');

const subjectEntrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    grade: { type: String, required: true },
    credits: { type: Number, required: true, min: 1 }
}, { _id: false });

const semesterSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semNumber: { type: Number, required: true, min: 1, max: 8 },
    subjects: [subjectEntrySchema],
    sgpa: { type: Number, default: 0 }
}, { timestamps: true });

semesterSchema.index({ user: 1, semNumber: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);

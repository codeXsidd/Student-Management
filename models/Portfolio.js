const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    techStack: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    status: { type: String, enum: ['In Progress', 'Completed', 'Paused'], default: 'In Progress' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Language', 'Framework', 'Tool', 'Database', 'Other'], default: 'Language' },
    proficiency: { type: Number, min: 1, max: 5, default: 1 }, // 1=Beginner, 5=Expert
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = {
    Project: mongoose.model('Project', projectSchema),
    Skill: mongoose.model('Skill', skillSchema)
};

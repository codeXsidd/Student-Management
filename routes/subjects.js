const express = require('express');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(auth);

// @GET /api/subjects — Get all subjects for user
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @POST /api/subjects — Add a subject
router.post('/', async (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Subject name is required.' });
        }

        const existing = await Subject.findOne({ name, user: req.userId });
        if (existing) {
            return res.status(400).json({ message: 'Subject with this name already exists.' });
        }

        const subject = new Subject({
            name,
            user: req.userId,
            color: color || '#6366f1'
        });

        await subject.save();
        res.status(201).json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @DELETE /api/subjects/:id — Delete a subject
router.delete('/:id', async (req, res) => {
    try {
        const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.json({ message: 'Subject deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;

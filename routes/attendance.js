const express = require('express');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// @POST /api/attendance — Mark attendance
router.post('/', async (req, res) => {
    try {
        const { subjectId, date, status } = req.body;

        if (!subjectId || !date || !status) {
            return res.status(400).json({ message: 'subjectId, date, and status are required.' });
        }

        // Verify subject belongs to user
        const subject = await Subject.findOne({ _id: subjectId, user: req.userId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // Normalize date to start of day
        const recordDate = new Date(date);
        recordDate.setHours(0, 0, 0, 0);

        // Upsert: update if exists
        const attendance = await Attendance.findOneAndUpdate(
            { subject: subjectId, user: req.userId, date: recordDate },
            { status },
            { upsert: true, new: true }
        );

        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @GET /api/attendance/summary — All subjects with attendance %
router.get('/summary', async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.userId });

        const summaries = await Promise.all(
            subjects.map(async (subject) => {
                const records = await Attendance.find({ subject: subject._id, user: req.userId });
                const total = records.length;
                const attended = records.filter(r => r.status === 'present').length;
                const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

                return {
                    subject: { _id: subject._id, name: subject.name, color: subject.color },
                    total,
                    attended,
                    absent: total - attended,
                    percentage
                };
            })
        );

        res.json(summaries);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @GET /api/attendance/:subjectId — Get records for a subject
router.get('/:subjectId', async (req, res) => {
    try {
        const subject = await Subject.findOne({ _id: req.params.subjectId, user: req.userId });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        const records = await Attendance.find({
            subject: req.params.subjectId,
            user: req.userId
        }).sort({ date: -1 });

        const total = records.length;
        const attended = records.filter(r => r.status === 'present').length;
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

        res.json({
            subject,
            records,
            stats: { total, attended, absent: total - attended, percentage }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// @DELETE /api/attendance/:id — Delete an attendance record
router.delete('/:id', async (req, res) => {
    try {
        const record = await Attendance.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!record) {
            return res.status(404).json({ message: 'Record not found.' });
        }
        res.json({ message: 'Record deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;

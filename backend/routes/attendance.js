const express = require('express');
const router = express.Router();
const { protect, adminOrTeacher } = require('../middleware/authMiddleware');
const { writeAttendance, getAttendanceByStudent, getAllAttendance } = require('../utils/dbHelper');

// @route   POST /api/attendance
// @desc    Mark attendance for multiple students
// @access  Private/Teacher
router.post('/', protect, adminOrTeacher, async (req, res) => {
  try {
    const { attendanceData } = req.body; // Array of { studentId, date, status, studentName, rollNumber }

    if (!attendanceData || !Array.isArray(attendanceData)) {
      return res.status(400).json({ message: 'Invalid attendance data' });
    }

    await writeAttendance(attendanceData);
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Server error marking attendance' });
  }
});

// @route   GET /api/attendance/student/:id
// @desc    Get attendance history for a student
// @access  Private
router.get('/student/:id', protect, async (req, res) => {
  try {
    // Student can only see their own attendance
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const attendance = await getAttendanceByStudent(req.params.id);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({ message: 'Server error fetching attendance' });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get global attendance summary
// @access  Private/Teacher
router.get('/summary', protect, adminOrTeacher, async (req, res) => {
  try {
    const allRecords = await getAllAttendance();
    res.json(allRecords);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, adminOrTeacher, onlyAdmin } = require('../middleware/authMiddleware');
const { readStudents, findStudentById, deleteStudent, updateStudent } = require('../utils/dbHelper');
const { generateRecommendations } = require('../utils/recommendationEngine');

// @route   GET /api/students
// @desc    Get all students
// @access  Private/Teacher
router.get('/', protect, adminOrTeacher, async (req, res) => {
  try {
    const students = await readStudents();
    // Filter out any users that are not 'student' (just in case)
    const studentData = students.filter(s => s.role === 'student');
    // Hide passwords before sending
    const sanitizedStudents = studentData.map(s => {
      const { password, ...rest } = s;
      return rest;
    });
    res.json(sanitizedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student profile
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await findStudentById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure a student can only view their own data, unless they are a teacher/admin
    if (req.user.role === 'student' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ message: 'Not authorized to view this profile' });
    }

    const { password, ...rest } = student;
    rest.smartRecommendation = generateRecommendations(rest);
    
    res.json(rest);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student
// @access  Private/Admin
router.delete('/:id', protect, onlyAdmin, async (req, res) => {
  try {
    const student = await findStudentById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await deleteStudent(req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
});

// @route   PUT /api/students/:id/grades
// @desc    Update student grades (for self-grading)
// @access  Private
router.put('/:id/grades', protect, async (req, res) => {
  try {
    const student = await findStudentById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure a student can only update their own data, unless they are a teacher/admin
    if (req.user.role === 'student' && String(req.user.id) !== String(req.params.id)) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const { math, science, english, history, art, studyTimeHours, termName } = req.body;

    const updatedData = {
      math: Number(math) || 0,
      science: Number(science) || 0,
      english: Number(english) || 0,
      history: Number(history) || 0,
      art: Number(art) || 0,
      studyTimeHours: Number(studyTimeHours) || 0
    };

    const avgScore = ((updatedData.math + updatedData.science + updatedData.english + updatedData.history + updatedData.art) / 5).toFixed(1);

    const historyEntry = {
      term: termName || 'Update',
      math: updatedData.math,
      science: updatedData.science,
      english: updatedData.english,
      history: updatedData.history,
      art: updatedData.art,
      average: Number(avgScore),
      date: new Date().toISOString()
    };

    const currentHistory = student.gradeHistory || [];
    updatedData.gradeHistory = [...currentHistory, historyEntry];

    const updatedStudent = await updateStudent(req.params.id, updatedData);
    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student grades:', error);
    res.status(500).json({ message: 'Server error updating grades' });
  }
});

// @route   POST /api/students/:id/feedback
// @desc    Add teacher feedback to a student
// @access  Private/Teacher
router.post('/:id/feedback', protect, adminOrTeacher, async (req, res) => {
  try {
    const student = await findStudentById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { comment, teacherName } = req.body;

    const feedbackEntry = {
      comment,
      teacherName: teacherName || 'A Teacher',
      date: new Date().toISOString()
    };

    const currentFeedback = student.teacherFeedback || [];
    const updatedData = {
      teacherFeedback: [...currentFeedback, feedbackEntry]
    };

    const updatedStudent = await updateStudent(req.params.id, updatedData);
    res.json(updatedStudent);
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ message: 'Server error adding feedback' });
  }
});

module.exports = router;

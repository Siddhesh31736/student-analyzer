const express = require('express');
const router = express.Router();
const { protect, adminOrTeacher } = require('../middleware/authMiddleware');
const { readStudents } = require('../utils/dbHelper');

// @route   GET /api/analytics
// @desc    Get aggregated analytics data for the teacher dashboard
// @access  Private/Teacher
router.get('/', protect, adminOrTeacher, async (req, res) => {
  try {
    const allStudents = await readStudents();
    const students = allStudents.filter(s => s.role === 'student');

    if (students.length === 0) {
      return res.json({
        totalStudents: 0,
        averageScore: 0,
        passRate: 0,
        topScorer: null,
        subjectAverages: [],
        passFailRatio: [],
        scatterData: [],
        atRiskStudents: []
      });
    }

    const subjects = ['math', 'science', 'english', 'history', 'art'];

    let totalScore = 0;
    let passCount = 0;
    let failCount = 0;
    let topScorer = null;
    let highestAverage = 0;
    let gradedStudentsCount = 0;

    const subjectTotals = { math: 0, science: 0, english: 0, history: 0, art: 0 };
    const scatterData = [];
    const atRiskStudents = [];

    students.forEach(student => {
      // Convert string scores to numbers just in case
      const scores = subjects.map(sub => Number(student[sub]) || 0);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      if (avgScore === 0) {
        // Skip ungraded students from averages and fail lists
        return;
      }

      gradedStudentsCount++;
      totalScore += avgScore;

      if (avgScore >= 40) {
        passCount++;
      } else {
        failCount++;
        atRiskStudents.push({
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          average: avgScore.toFixed(2)
        });
      }

      if (avgScore > highestAverage) {
        highestAverage = avgScore;
        topScorer = { name: student.name, average: avgScore.toFixed(2) };
      }

      subjects.forEach(sub => {
        subjectTotals[sub] += (Number(student[sub]) || 0);
      });

      scatterData.push({
        x: Number(student.studyTimeHours) || 0,
        y: avgScore,
        name: student.name
      });
    });

    const overallAverage = gradedStudentsCount > 0 ? totalScore / gradedStudentsCount : 0;
    const passRate = gradedStudentsCount > 0 ? (passCount / gradedStudentsCount) * 100 : 0;

    const subjectAverages = subjects.map(sub => ({
      subject: sub.charAt(0).toUpperCase() + sub.slice(1),
      average: gradedStudentsCount > 0 ? (subjectTotals[sub] / gradedStudentsCount).toFixed(2) : "0.00"
    }));

    const passFailRatio = [
      { name: 'Pass', value: passCount },
      { name: 'Fail', value: failCount },
      { name: 'Ungraded', value: students.length - gradedStudentsCount }
    ];

    res.json({
      totalStudents: students.length,
      averageScore: overallAverage.toFixed(2),
      passRate: passRate.toFixed(2),
      topScorer,
      subjectAverages,
      passFailRatio,
      scatterData,
      atRiskStudents
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;

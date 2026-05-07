const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  readStudents, writeStudent, updateStudent, findStudentByEmail, findStudentById,
  findUserByEmail, findUserById, writeUser, updateUser 
} = require('../utils/dbHelper');
const { protect, onlyAdmin, adminOrTeacher } = require('../middleware/authMiddleware');

// Hardcoded teacher and admin for demo purposes.
// On first run, we seed them into Firestore if they don't exist.
const SEED_USERS = [
  {
    name: 'Admin Teacher',
    email: 'teacher@school.com',
    password: 'password',
    role: 'teacher'
  },
  {
    name: 'Super Admin',
    email: 'admin@school.com',
    password: 'admin',
    role: 'admin'
  }
];

// Seed teacher/admin into Firestore if not already present
const seedUsers = async () => {
  for (const user of SEED_USERS) {
    const existing = await findUserByEmail(user.email);
    if (!existing) {
      await writeUser(user);
      console.log(`Seeded user: ${user.email} (${user.role})`);
    }
  }
};
seedUsers().catch(err => console.error('Error seeding users:', err));

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretkey_student_analyzer_123', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check users collection (teacher/admin)
    const user = await findUserByEmail(email);
    if (user && user.password === password) {
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    }

    // Check students collection
    const student = await findStudentByEmail(email);
    if (student && String(student.password) === String(password)) {
      return res.json({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        token: generateToken(student.id, student.role || 'student'),
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new student
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, gender, parentalEducation, math, science, english, history, art, studyTimeHours } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists in students or users collection
    const existingStudent = await findStudentByEmail(email);
    const existingUser = await findUserByEmail(email);

    if (existingStudent || existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a roll number
    const students = await readStudents();
    const maxRoll = students.length > 0 ? Math.max(...students.map(s => Number(s.rollNumber) || 0)) : 200;

    const newStudent = {
      name,
      rollNumber: maxRoll + 1,
      email,
      password, // Storing raw password for simplicity in this prototype
      role: 'student',
      gender: gender || 'Not Specified',
      parentalEducation: parentalEducation || 'Not Specified',
      math: math || 0,
      science: science || 0,
      english: english || 0,
      history: history || 0,
      art: art || 0,
      studyTimeHours: studyTimeHours || 0,
      createdAt: new Date().toISOString()
    };

    const savedStudent = await writeStudent(newStudent);

    res.status(201).json({
      id: savedStudent.id,
      name: savedStudent.name,
      email: savedStudent.email,
      role: savedStudent.role,
      token: generateToken(savedStudent.id, savedStudent.role),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/add-teacher
// @desc    Add a new teacher
// @access  Private/Admin
router.post('/add-teacher', protect, onlyAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await findUserByEmail(email);
    const existingStudent = await findStudentByEmail(email);

    if (existingUser || existingStudent) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newTeacher = {
      name,
      email,
      password,
      role: 'teacher',
      createdAt: new Date().toISOString()
    };

    const savedTeacher = await writeUser(newTeacher);

    res.status(201).json({
      id: savedTeacher.id,
      name: savedTeacher.name,
      email: savedTeacher.email,
      role: savedTeacher.role
    });
  } catch (error) {
    console.error('Add teacher error:', error);
    res.status(500).json({ message: 'Server error adding teacher' });
  }
});

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'student') {
      await updateStudent(userId, { name, email });
    } else {
      await updateUser(userId, { name, email });
    }

    res.json({ message: 'Profile updated successfully', name, email });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// @route   PUT /api/auth/update-password
// @desc    Update user password
// @access  Private
router.put('/update-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    let user;
    if (role === 'student') {
      user = await findStudentById(userId);
    } else {
      user = await findUserById(userId);
    }

    if (!user || String(user.password) !== String(currentPassword)) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    if (role === 'student') {
      await updateStudent(userId, { password: newPassword });
    } else {
      await updateUser(userId, { password: newPassword });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
});

// @route   POST /api/auth/bulk-register
// @desc    Bulk register students
// @access  Private/Teacher
router.post('/bulk-register', protect, adminOrTeacher, async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Invalid students data' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const s of students) {
      try {
        const existing = await findStudentByEmail(s.email);
        if (existing) {
          results.skipped++;
          continue;
        }

        await writeStudent({
          name: s.name,
          email: s.email,
          rollNumber: s.rollNumber,
          password: s.password || 'password123',
          role: 'student',
          math: 0, science: 0, english: 0, history: 0, art: 0,
          studyTimeHours: 0,
          createdAt: new Date().toISOString()
        });
        results.added++;
      } catch (err) {
        results.errors.push({ email: s.email, error: err.message });
      }
    }

    res.json({ message: 'Bulk registration complete', results });
  } catch (error) {
    console.error('Bulk register error:', error);
    res.status(500).json({ message: 'Server error during bulk registration' });
  }
});

module.exports = router;

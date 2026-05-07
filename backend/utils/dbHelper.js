const { db } = require('../firebaseAdmin');

const STUDENTS_COLLECTION = 'students';
const USERS_COLLECTION = 'users';

// ---- Students Collection ----

const readStudents = async () => {
  const snapshot = await db.collection(STUDENTS_COLLECTION).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const writeStudent = async (studentData) => {
  const docRef = await db.collection(STUDENTS_COLLECTION).add(studentData);
  return { id: docRef.id, ...studentData };
};

const deleteStudent = async (id) => {
  await db.collection(STUDENTS_COLLECTION).doc(id).delete();
};

const updateStudent = async (id, data) => {
  await db.collection(STUDENTS_COLLECTION).doc(id).update(data);
  return { id, ...data };
};

const findStudentByEmail = async (email) => {
  const snapshot = await db.collection(STUDENTS_COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const findStudentById = async (id) => {
  const doc = await db.collection(STUDENTS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

// ---- Users Collection (teachers, admins) ----

const findUserByEmail = async (email) => {
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

const findUserById = async (id) => {
  const doc = await db.collection(USERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const writeUser = async (userData) => {
  const docRef = await db.collection(USERS_COLLECTION).add(userData);
  return { id: docRef.id, ...userData };
};

const updateUser = async (id, data) => {
  await db.collection(USERS_COLLECTION).doc(id).update(data);
  return { id, ...data };
};

const ATTENDANCE_COLLECTION = 'attendance';

// ---- Attendance Collection ----

const writeAttendance = async (attendanceData) => {
  for (const record of attendanceData) {
    // 1. Find and delete any existing records for this student on this date (cleanup duplicates)
    const existingSnapshot = await db.collection(ATTENDANCE_COLLECTION)
      .where('studentId', '==', record.studentId)
      .where('date', '==', record.date)
      .get();
    
    if (!existingSnapshot.empty) {
      const deleteBatch = db.batch();
      existingSnapshot.docs.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
    }

    // 2. Save the new unique record
    const docId = `${record.studentId}_${record.date}`;
    await db.collection(ATTENDANCE_COLLECTION).doc(docId).set({
      ...record,
      updatedAt: new Date().toISOString()
    });
  }
};

const getAttendanceByStudent = async (studentId) => {
  const snapshot = await db.collection(ATTENDANCE_COLLECTION)
    .where('studentId', '==', studentId)
    .get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const getAllAttendance = async () => {
  const snapshot = await db.collection(ATTENDANCE_COLLECTION).get();
  if (snapshot.empty) return [];
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

module.exports = {
  readStudents,
  writeStudent,
  deleteStudent,
  updateStudent,
  findStudentByEmail,
  findStudentById,
  findUserByEmail,
  findUserById,
  writeUser,
  updateUser,
  writeAttendance,
  getAttendanceByStudent,
  getAllAttendance,
};

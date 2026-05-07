import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Users, CheckCircle, TrendingUp, Award, Search, Filter, MessageSquare, Calendar, Save, FileUp } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
  <div className="glass p-6 rounded-2xl shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const [activeTab, setActiveTab] = useState('performance');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [analyticsRes, studentsRes] = await Promise.all([
          axios.get('https://student-analyzer-1kn5.onrender.com/api/analytics', config),
          axios.get('https://student-analyzer-1kn5.onrender.com/api/students', config)
        ]);
        setData(analyticsRes.data);
        setStudents(studentsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const studentsToRegister = results.data.map(row => ({
          name: row.Name || row.name,
          email: row.Email || row.email,
          rollNumber: row.RollNo || row.rollNumber,
          password: row.Password || row.password || 'password123'
        })).filter(s => s.name && s.email);

        if (studentsToRegister.length === 0) {
          alert('No valid student data found in CSV. Headers should be: name, email, rollNumber');
          return;
        }

        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const res = await axios.post('https://student-analyzer-1kn5.onrender.com/api/auth/bulk-register', { students: studentsToRegister }, config);
          alert(`Bulk upload complete! Added: ${res.data.results.added}, Skipped: ${res.data.results.skipped}`);
          // Refresh student list
          const studentsRes = await axios.get('https://student-analyzer-1kn5.onrender.com/api/students', config);
          setStudents(studentsRes.data);
        } catch (err) {
          console.error(err);
          alert('Bulk upload failed');
        }
      }
    });
  };

  if (loading || !data) return (
    <div className="flex-grow flex items-center justify-center dark:bg-dark-bg text-gray-500 dark:text-gray-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.rollNumber).includes(searchTerm)
  );

  return (
    <div className="flex-grow bg-gray-50 dark:bg-dark-bg p-6 lg:p-8 page-enter-active">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Overview of student performance metrics</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white dark:bg-dark-surface p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <button 
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'performance' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Performance
              </button>
              <button 
                onClick={() => setActiveTab('attendance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'attendance' ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Attendance
              </button>
            </div>
            <Link to="/reports" className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm">
              Download Report
            </Link>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Students" value={data.totalStudents} 
            icon={Users} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
          />
          <StatCard 
            title="Average Score" value={`${data.averageScore}%`} 
            icon={TrendingUp} colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
          />
          <StatCard 
            title="Pass Rate" value={`${data.passRate}%`} subtitle="Above 40%"
            icon={CheckCircle} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
          />
          <StatCard 
            title="Top Scorer" value={data.topScorer ? data.topScorer.name : 'N/A'} subtitle={data.topScorer ? `${data.topScorer.average}% avg` : ''}
            icon={Award} colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
          />
        </div>

        {activeTab === 'performance' ? (
          <>
            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl shadow-sm lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Average Marks by Subject</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectAverages} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis dataKey="subject" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                      <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Pass vs Fail Ratio</h3>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.passFailRatio}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.passFailRatio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Study Time vs Final Grade</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis type="number" dataKey="x" name="Study Hours" unit="h" stroke="#6b7280" />
                      <YAxis type="number" dataKey="y" name="Grade" unit="%" stroke="#6b7280" />
                      <ZAxis type="category" dataKey="name" name="Student" />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                      <Scatter name="Students" data={data.scatterData} fill="#8b5cf6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-red-500">At-Risk Students (&lt; 40%)</h3>
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {data.atRiskStudents.length > 0 ? data.atRiskStudents.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Roll: {student.rollNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600 dark:text-red-400">{student.average}%</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">No at-risk students. Great job!</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass rounded-2xl shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-primary-50/30 dark:bg-primary-900/5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Attendance</h3>
                  <p className="text-xs text-gray-500">Mark student presence for today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
                <button 
                  onClick={async () => {
                    setSubmittingAttendance(true);
                    try {
                      const records = students.map(s => ({
                        studentId: s.id,
                        studentName: s.name,
                        rollNumber: s.rollNumber,
                        date: attendanceDate,
                        status: attendanceRecords[s.id], // No default here
                        markedBy: user.name,
                        teacherId: user.id
                      }));

                      if (records.some(r => !r.status)) {
                        alert('Please mark attendance for all students before saving.');
                        setSubmittingAttendance(false);
                        return;
                      }

                      const config = { headers: { Authorization: `Bearer ${user.token}` } };
                      await axios.post('https://student-analyzer-1kn5.onrender.com/api/attendance', { attendanceData: records }, config);
                      alert('Attendance saved successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to save attendance');
                    } finally {
                      setSubmittingAttendance(false);
                    }
                  }}
                  disabled={submittingAttendance}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={18} /> {submittingAttendance ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Roll No</th>
                    <th className="p-4 font-medium text-right">
                      <button 
                        onClick={() => {
                          const allPresent = {};
                          students.forEach(s => allPresent[s.id] = 'present');
                          setAttendanceRecords(allPresent);
                        }}
                        className="text-[10px] uppercase tracking-wider bg-primary-100 text-primary-700 px-2 py-1 rounded hover:bg-primary-200 transition-colors"
                      >
                        Mark All Present
                      </button>
                    </th>
                    <th className="p-4 font-medium">Student Name</th>
                    <th className="p-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/30 transition-colors">
                      <td className="p-4 text-sm text-gray-500" colSpan={2}>{s.rollNumber}</td>
                      <td className="p-4 text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        {s.name}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => setAttendanceRecords({...attendanceRecords, [s.id]: 'present'})}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              attendanceRecords[s.id] === 'present' 
                              ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-500'
                            }`}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => setAttendanceRecords({...attendanceRecords, [s.id]: 'absent'})}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              attendanceRecords[s.id] === 'absent' 
                              ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-gray-800 dark:text-gray-500'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Data Table */}
        <div className="glass rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Student Roster</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center gap-2 cursor-pointer">
                <FileUp size={18} /> Bulk Upload (CSV)
                <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
              </label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 text-sm">
                  <th className="p-4 font-medium">Roll No</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Math</th>
                  <th className="p-4 font-medium">Science</th>
                  <th className="p-4 font-medium">English</th>
                  <th className="p-4 font-medium">Avg Grade</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {filteredStudents.map((s) => {
                  const avgStr = ((Number(s.math) + Number(s.science) + Number(s.english) + Number(s.history) + Number(s.art)) / 5).toFixed(1);
                  const isUngraded = avgStr === "0.0";
                  const avg = Number(avgStr);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/30 transition-colors text-gray-700 dark:text-gray-300">
                      <td className="p-4">{s.rollNumber}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="p-4">{isUngraded ? '-' : s.math}</td>
                      <td className="p-4">{isUngraded ? '-' : s.science}</td>
                      <td className="p-4">{isUngraded ? '-' : s.english}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isUngraded ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                          avg >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          avg >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {isUngraded ? 'N/A' : `${avgStr}%`}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsFeedbackModalOpen(true);
                          }}
                          className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                          title="Leave Feedback"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Modal */}
        {isFeedbackModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800 animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Leave Feedback</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Sharing feedback for <span className="font-bold text-gray-900 dark:text-white">{selectedStudent.name}</span></p>
              
              <textarea 
                className="w-full h-32 p-4 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white outline-none resize-none"
                placeholder="Write your advice or feedback here..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => {
                    setIsFeedbackModalOpen(false);
                    setFeedbackComment('');
                  }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={submittingFeedback || !feedbackComment.trim()}
                  onClick={async () => {
                    setSubmittingFeedback(true);
                    try {
                      const config = { headers: { Authorization: `Bearer ${user.token}` } };
                      await axios.post(`https://student-analyzer-1kn5.onrender.com/api/students/${selectedStudent.id}/feedback`, { 
                        comment: feedbackComment,
                        teacherName: user.name || 'Teacher'
                      }, config);
                      setIsFeedbackModalOpen(false);
                      setFeedbackComment('');
                      alert('Feedback sent successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to send feedback');
                    } finally {
                      setSubmittingFeedback(false);
                    }
                  }}
                  className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submittingFeedback ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeacherDashboard;

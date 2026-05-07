import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
  LineChart, Line
} from 'recharts';
import { Award, Book, Clock, Target, CheckCircle, AlertTriangle, MessageSquare, UserCheck } from 'lucide-react';

const SubjectCard = ({ subject, score }) => {
  const isUngraded = score === 0 || score === null;
  const isPass = score >= 40;
  
  let borderColor = 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50';
  let scoreColor = 'text-gray-400 dark:text-gray-500';
  let statusIcon = <Clock size={14} className="text-gray-400" />;
  let statusText = 'Awaiting Grade';

  if (!isUngraded) {
    borderColor = isPass ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10';
    scoreColor = isPass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    statusIcon = isPass ? <CheckCircle size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />;
    statusText = isPass ? 'Pass' : 'Fail';
  }

  return (
    <div className={`p-4 rounded-xl border ${borderColor} flex flex-col items-center justify-center transition-transform hover:-translate-y-1`}>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize mb-2">{subject}</h4>
      <p className={`text-3xl font-bold ${scoreColor}`}>{isUngraded ? 'N/A' : `${score}%`}</p>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400">
        {statusIcon} {statusText}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    math: 0, science: 0, english: 0, history: 0, art: 0, studyTimeHours: 0, termName: ''
  });
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`https://student-analyzer-1kn5.onrender.com/api/students/${user.id}`, config);
        setData(res.data);
        setFormData({
          math: res.data.math || 0,
          science: res.data.science || 0,
          english: res.data.english || 0,
          history: res.data.history || 0,
          art: res.data.art || 0,
          studyTimeHours: res.data.studyTimeHours || 0,
          termName: ''
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchAttendance = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`https://student-analyzer-1kn5.onrender.com/api/attendance/student/${user.id}`, config);
        setAttendance(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) {
      fetchStudentData();
      fetchAttendance();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`https://student-analyzer-1kn5.onrender.com/api/students/${user.id}/grades`, formData, config);
      setData(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Error updating grades');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) return (
    <div className="flex-grow flex items-center justify-center dark:bg-dark-bg text-gray-500 dark:text-gray-400">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  const subjects = ['math', 'science', 'english', 'history', 'art'];
  const scores = subjects.map(sub => Number(data[sub]) || 0);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

  const radarData = subjects.map(sub => ({
    subject: sub.charAt(0).toUpperCase() + sub.slice(1),
    score: Number(data[sub]) || 0,
    fullMark: 100,
  }));

  const isNewStudent = avgScore === "0.0";

  let badge = { text: 'Needs Improvement', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (isNewStudent) badge = { text: 'New Student', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' };
  else if (avgScore >= 80) badge = { text: 'Excellent', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
  else if (avgScore >= 60) badge = { text: 'Good', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  else if (avgScore >= 40) badge = { text: 'Average', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };

  const attendanceRate = attendance.length > 0 
    ? ((attendance.filter(r => r.status === 'present').length / attendance.length) * 100).toFixed(1)
    : 'N/A';

  return (
    <div className="flex-grow bg-gray-50 dark:bg-dark-bg p-6 lg:p-8 page-enter-active">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section with personalized greeting and badge */}
        <div className="glass p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                Hello, {data.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mb-4">
                {isNewStudent ? "Welcome to your dashboard! Enter your grades below to see your performance analysis."
                 : avgScore >= 80 ? "Outstanding performance! Keep up the excellent work and continue to push your boundaries." 
                 : avgScore >= 60 ? "Good job! You're doing well. With a little more effort, you can reach the top." 
                 : "Don't get discouraged! Focus on your weak areas and track your study time."}
              </p>
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-primary-500/30 transition-colors"
              >
                {isNewStudent ? 'Enter My Grades' : 'Update Grades'}
              </button>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm shadow-sm flex items-center gap-2 ${badge.color}`}>
                <Award size={18} /> {badge.text}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall Average</p>
                <p className="text-4xl font-black text-gray-900 dark:text-white">{isNewStudent ? 'N/A' : `${avgScore}%`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Smart Insights */}
        {!isNewStudent && data.smartRecommendation && (
          <div className="glass p-6 rounded-2xl shadow-sm border border-primary-200 dark:border-primary-900 bg-primary-50/50 dark:bg-primary-900/10">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span> Smart Insights
            </h3>
            <p className="text-primary-800 dark:text-primary-200 leading-relaxed">
              {data.smartRecommendation}
            </p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Radar Chart */}
          <div className="glass p-6 rounded-2xl shadow-sm lg:col-span-1 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 w-full text-left">Skill Radar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 w-full text-left">Your strength across all subjects</p>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#374151" opacity={0.2} />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#6b7280', fontSize: 12}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <RechartsTooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subjects Scorecards */}
          <div className="glass p-6 rounded-2xl shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Subject Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {subjects.map(sub => (
                <SubjectCard key={sub} subject={sub} score={data[sub]} />
              ))}
            </div>
          </div>

          {/* Historical Trend Chart */}
          {data.gradeHistory && data.gradeHistory.length > 0 && (
            <div className="glass p-6 rounded-2xl shadow-sm lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Historical Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Your average score over time</p>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.gradeHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="term" stroke="#6b7280" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={12} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#1e1e1e', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                    <Line type="monotone" dataKey="average" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} name="Average %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid 2: Study & Attendance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl shadow-sm flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Study Time Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                You've recorded <strong className="text-gray-800 dark:text-gray-200">{data.studyTimeHours} hours</strong>. 
              </p>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl shadow-sm flex items-center gap-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
              attendanceRate === 'N/A' ? 'bg-gray-100 text-gray-500' : 
              Number(attendanceRate) >= 75 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              <UserCheck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Rate</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Your presence: <strong className={attendanceRate !== 'N/A' && Number(attendanceRate) >= 75 ? 'text-green-600' : 'text-red-600'}>
                  {attendanceRate}{attendanceRate !== 'N/A' ? '%' : ''}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Log Section */}
        {attendance && attendance.length > 0 && (
          <div className="glass p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <UserCheck size={20} className="text-primary-500" /> Attendance History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                  {attendance.slice(0, 5).map((record, idx) => (
                    <tr key={idx} className="text-gray-700 dark:text-gray-300">
                      <td className="p-4">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          record.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs text-gray-500">
                        {record.markedBy || 'System'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {attendance.length > 5 && (
                <p className="text-center text-xs text-gray-500 mt-4">Showing last 5 records</p>
              )}
            </div>
          </div>
        )}

        {/* Teacher Feedback Section */}
        {data.teacherFeedback && data.teacherFeedback.length > 0 && (
          <div className="glass p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary-500" /> Messages from Teachers
            </h3>
            <div className="space-y-4">
              {data.teacherFeedback.map((fb, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-surface/50 border border-gray-100 dark:border-gray-800 rounded-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{fb.teacherName}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(fb.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">"{fb.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-800 animate-fade-in-up">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Enter Your Grades</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term / Exam Name</label>
                  <input 
                    type="text" 
                    name="termName"
                    value={formData.termName} 
                    onChange={handleChange}
                    placeholder="e.g. Term 1, Midterms, Final Exam"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {subjects.map((sub) => (
                    <div key={sub}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize mb-1">{sub}</label>
                      <input 
                        type="number" 
                        name={sub}
                        value={formData[sub]} 
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                        min="0" max="100" required
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Study Hours</label>
                    <input 
                      type="number" 
                      name="studyTimeHours"
                      value={formData.studyTimeHours} 
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                      min="0" required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Grades'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentDashboard;

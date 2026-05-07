import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Shield, Trash2, Users, AlertTriangle, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });

  const fetchStudents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get('http://localhost:5000/api/students', config);
      setStudents(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`http://localhost:5000/api/students/${id}`, config);
        toast.success('Student deleted successfully');
        fetchStudents(); // Refresh list
      } catch (err) {
        toast.error('Failed to delete student');
        console.error(err);
      }
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/auth/add-teacher', newTeacher, config);
      toast.success('Teacher added successfully');
      setNewTeacher({ name: '', email: '', password: '' });
      setIsAddingTeacher(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add teacher');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 dark:bg-dark-bg page-enter-active text-center">
        <AlertTriangle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gray-50 dark:bg-dark-bg p-6 lg:p-8 page-enter-active">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="text-red-500" /> Admin Control Panel
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Manage platform users and view statistics.</p>
          </div>
          <button 
            onClick={() => setIsAddingTeacher(!isAddingTeacher)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <UserPlus size={18} /> {isAddingTeacher ? 'Cancel' : 'Add Teacher'}
          </button>
        </header>

        {isAddingTeacher && (
          <div className="glass p-6 rounded-2xl shadow-sm animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Register New Teacher</h3>
            <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Temporary Password</label>
                <input 
                  type="password" 
                  className="w-full px-3 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({...newTeacher, password: e.target.value})}
                  required
                />
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm h-[38px]"
              >
                Create Account
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
             <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
               <Users size={24} />
             </div>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{students.length}</h3>
             <p className="text-sm text-gray-500">Registered Students</p>
          </div>
          <div className="glass p-6 rounded-2xl shadow-sm flex flex-col items-center text-center">
             <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
               <Shield size={24} />
             </div>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-white">2</h3>
             <p className="text-sm text-gray-500">Active Staff (Teacher/Admin)</p>
          </div>
        </div>

        <div className="glass rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-dark-surface/50 text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="p-4 font-medium">ID</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/30 transition-colors text-gray-700 dark:text-gray-300">
                    <td className="p-4">{s.id}</td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                    <td className="p-4">{s.email}</td>
                    <td className="p-4 capitalize">{s.role}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;

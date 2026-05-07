import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Lock, Mail, Shield, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('https://student-analyzer-1kn5.onrender.com/api/auth/update-profile', profileData, config);
      
      // Update local storage and context
      const updatedUser = { ...user, name: profileData.name, email: profileData.email };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('https://student-analyzer-1kn5.onrender.com/api/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, config);
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-gray-50 dark:bg-dark-bg p-6 lg:p-8 page-enter-active">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="text-primary-600" /> My Profile Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your personal information and account security.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Section */}
          <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <User size={20} className="text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">General Information</h3>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email" 
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account Role</label>
                <div className="relative">
                  <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg text-sm text-gray-500 cursor-not-allowed capitalize"
                    value={user?.role}
                    disabled
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} /> {loading ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="glass p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
              <Lock size={20} className="text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Security</h3>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Current Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-900 dark:bg-primary-600 hover:bg-black dark:hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle size={18} /> {loading ? 'Processing...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;

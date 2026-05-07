import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, User, LogOut, Menu, X, School } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isActive(to)
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <Icon size={18} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="glass sticky top-0 z-50 px-4 py-3 mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400">
          <School size={32} />
          <span className="hidden sm:inline">EduAnalyzer</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin" icon={Users}>Admin</NavLink>}
              {user.role === 'teacher' && <NavLink to="/teacher" icon={LayoutDashboard}>Teacher Dashboard</NavLink>}
              {user.role === 'student' && <NavLink to="/student" icon={LayoutDashboard}>Student Dashboard</NavLink>}
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium">Login</Link>
              <Link to="/register" className="px-6 py-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-all font-medium">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 animate-slide-down">
          {user ? (
            <>
              {user.role === 'admin' && <NavLink to="/admin" icon={Users}>Admin</NavLink>}
              {user.role === 'teacher' && <NavLink to="/teacher" icon={LayoutDashboard}>Teacher Dashboard</NavLink>}
              {user.role === 'student' && <NavLink to="/student" icon={LayoutDashboard}>Student Dashboard</NavLink>}
              <NavLink to="/profile" icon={User}>Profile</NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-2">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 bg-primary-600 text-white rounded-lg text-center shadow-lg hover:bg-primary-700 transition-all font-medium">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, BookOpen, ChevronRight, Award } from 'lucide-react';

const StatCounter = ({ label, value, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value.substring(0, value.length)) || 0;
    if (start === end) return;

    let totalMilSecDur = parseInt(duration);
    let incrementTime = (totalMilSecDur / end) * 2;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
      <h3 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
        {count}{suffix}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 font-medium">{label}</p>
    </div>
  );
};

const Landing = () => {
  return (
    <div className="flex-grow flex flex-col page-enter-active">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-dark-bg dark:to-dark-surface pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">
            Analyze Performance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
              Unlock Potential.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto mb-10">
            A professional web platform for teachers and students to track academic growth, 
            identify at-risk areas, and celebrate success through deep data analytics.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
            >
              Get Started <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 dark:bg-dark-surface dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-16 relative z-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCounter label="Active Students" value="1200" suffix="+" />
          <StatCounter label="Subjects Tracked" value="50" suffix="+" />
          <StatCounter label="Average Pass Rate" value="85" suffix="%" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Everything you need to succeed</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Deep Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Visualize performance trends over time using interactive charts and find correlations between study habits and grades.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Teacher Dashboard</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Instantly identify top performers and at-risk students. Filter and generate reports across different demographics.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Student Portal</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Students get personalized feedback, radar charts showing their strengths, and comparison bars against class averages.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

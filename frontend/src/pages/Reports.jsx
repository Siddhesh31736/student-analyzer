import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { Download, FileText, FileSpreadsheet, Search } from 'lucide-react';

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get('http://localhost:5000/api/students', config);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStudents();
  }, [user]);

  const calculateAverage = (s) => {
    const scores = [s.math, s.science, s.english, s.history, s.art].map(Number);
    return (scores.reduce((a, b) => a + (b || 0), 0) / 5).toFixed(2);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.rollNumber).includes(searchTerm)
  );

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Student Performance Report", 14, 15);
    
    const tableColumn = ["Roll No", "Name", "Math", "Science", "English", "History", "Art", "Average"];
    const tableRows = [];

    filteredStudents.forEach(student => {
      const studentData = [
        student.rollNumber,
        student.name,
        student.math,
        student.science,
        student.english,
        student.history,
        student.art,
        calculateAverage(student) + "%"
      ];
      tableRows.push(studentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    
    doc.save(`student_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    const csvData = filteredStudents.map(student => ({
      RollNo: student.rollNumber,
      Name: student.name,
      Math: student.math,
      Science: student.science,
      English: student.english,
      History: student.history,
      Art: student.art,
      Average: calculateAverage(student)
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `student_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gray-50 dark:bg-dark-bg p-6 lg:p-8 page-enter-active">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Reports</h1>
            <p className="text-gray-500 dark:text-gray-400">Generate, view, and export student grades.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportCSV}
              className="px-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FileSpreadsheet size={16} /> Export CSV
            </button>
            <button 
              onClick={exportPDF}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2 shadow-sm shadow-primary-500/30"
            >
              <FileText size={16} /> Download PDF
            </button>
          </div>
        </header>

        <div className="glass rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Download size={20} className="text-primary-500" /> Full Roster
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or roll number..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 dark:bg-dark-surface z-10 shadow-sm">
                <tr className="text-gray-500 dark:text-gray-400 text-sm">
                  <th className="p-4 font-medium">Roll No</th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Math</th>
                  <th className="p-4 font-medium">Science</th>
                  <th className="p-4 font-medium">English</th>
                  <th className="p-4 font-medium">History</th>
                  <th className="p-4 font-medium">Art</th>
                  <th className="p-4 font-medium">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                {filteredStudents.length > 0 ? filteredStudents.map((s) => {
                  const avg = calculateAverage(s);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-dark-surface/30 transition-colors text-gray-700 dark:text-gray-300">
                      <td className="p-4">{s.rollNumber}</td>
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{s.name}</td>
                      <td className="p-4">{s.math}</td>
                      <td className="p-4">{s.science}</td>
                      <td className="p-4">{s.english}</td>
                      <td className="p-4">{s.history}</td>
                      <td className="p-4">{s.art}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          avg >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          avg >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {avg}%
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No students found matching your search.
                    </td>
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

export default Reports;

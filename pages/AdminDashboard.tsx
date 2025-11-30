import React, { useState, useEffect } from 'react';
import { mockDb } from '../services/mockDb';
import { analyzeWorkLogs } from '../services/geminiService';
import { WorkLog, User } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Download, Filter, Plus, Search, Sparkles, FileDown, Users, X 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const AdminDashboard: React.FC = () => {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  
  // AI Report State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Employee Add State
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [l, e] = await Promise.all([mockDb.getLogs(), mockDb.getEmployees()]);
    setLogs(l);
    setEmployees(e);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    log.employeeName.toLowerCase().includes(filterText.toLowerCase()) ||
    log.jobName.toLowerCase().includes(filterText.toLowerCase()) ||
    log.customerName.toLowerCase().includes(filterText.toLowerCase())
  );

  // Stats for Cards
  const totalJobs = logs.length;
  const completedToday = logs.filter(l => 
    l.progress === 100 && new Date(l.date).toDateString() === new Date().toDateString()
  ).length;
  const avgProgress = logs.length > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + curr.progress, 0) / logs.length) 
    : 0;
  const activeStaff = new Set(logs.map(l => l.employeeId)).size;

  // Chart Data
  const chartData = employees.map(emp => {
    const empLogs = logs.filter(l => l.employeeId === emp.id);
    return {
      name: emp.name.split(' ')[0],
      jobs: empLogs.length,
      avg: empLogs.length > 0 ? empLogs.reduce((a, b) => a + b.progress, 0) / empLogs.length : 0
    };
  });

  const handleGenerateReport = async () => {
    setAiLoading(true);
    setShowAiModal(true);
    const report = await analyzeWorkLogs(filteredLogs);
    setAiReport(report);
    setAiLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmpName && newEmpEmail) {
      await mockDb.addEmployee(newEmpName, newEmpEmail, newEmpDept || 'General');
      setShowAddEmp(false);
      setNewEmpName(''); setNewEmpEmail(''); setNewEmpDept('');
      loadData();
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Employee", "Date", "Job", "Customer", "Progress", "Details"];
    const rows = filteredLogs.map(l => [
      l.id, l.employeeName, l.date.split('T')[0], l.jobName, l.customerName, `${l.progress}%`, l.workDetails.replace(/,/g, ' ')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lion_smart_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-slate-400 text-sm font-medium uppercase">Total Jobs</h3>
          <p className="text-3xl font-bold mt-2">{totalJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Completed Today</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{completedToday}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Avg. Progress</h3>
          <p className="text-3xl font-bold mt-2 text-accent-600">{avgProgress}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Active Staff</h3>
          <p className="text-3xl font-bold mt-2 text-gray-800">{activeStaff}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search jobs, employees..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={exportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors">
                <FileDown size={16} /> Export CSV
              </button>
              <button onClick={handleGenerateReport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-500 to-orange-500 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all">
                <Sparkles size={16} /> AI Insights
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Employee</th>
                    <th className="px-6 py-3 font-medium">Job Name</th>
                    <th className="px-6 py-3 font-medium">Details</th>
                    <th className="px-6 py-3 font-medium">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading data...</td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">No records found.</td></tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(log.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{log.employeeName}</td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{log.jobName}</div>
                          <div className="text-xs text-gray-400">{log.customerName}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.workDetails}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-full rounded-full ${log.progress === 100 ? 'bg-green-500' : 'bg-accent-500'}`} style={{ width: `${log.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{log.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Charts & Management */}
        <div className="space-y-6">
           {/* Chart */}
           <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="font-semibold text-gray-800 mb-4">Performance Overview</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="jobs" fill="#453531" radius={[4, 4, 0, 0]} barSize={30}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#453531' : '#d97706'} />
                       ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Employee Management */}
           <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Team Members</h3>
                <button 
                  onClick={() => setShowAddEmp(!showAddEmp)}
                  className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
             </div>
             
             {showAddEmp && (
               <form onSubmit={handleAddEmployee} className="mb-4 bg-gray-50 p-3 rounded-lg space-y-2">
                  <input 
                    type="text" placeholder="Name" required
                    className="w-full text-sm p-2 border rounded"
                    value={newEmpName} onChange={e => setNewEmpName(e.target.value)}
                  />
                   <input 
                    type="email" placeholder="Email" required
                    className="w-full text-sm p-2 border rounded"
                    value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)}
                  />
                   <input 
                    type="text" placeholder="Department" required
                    className="w-full text-sm p-2 border rounded"
                    value={newEmpDept} onChange={e => setNewEmpDept(e.target.value)}
                  />
                  <button type="submit" className="w-full py-1.5 bg-slate-800 text-white text-xs rounded font-medium">Add Member</button>
               </form>
             )}

             <div className="space-y-3">
               {employees.map(emp => (
                 <div key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.department}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* AI Report Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="text-accent-500" />
                <h2 className="font-bold text-lg">Daily Work Insights</h2>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-500"></div>
                   <p className="text-gray-500 animate-pulse">Analyzing {filteredLogs.length} work logs...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none text-gray-700">
                   <ReactMarkdown>{aiReport || ''}</ReactMarkdown>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
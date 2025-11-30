
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { AttendanceRecord, Role } from '../types';
import { 
  Calendar, Clock, Search, User, Download, TrendingUp, AlertCircle, CheckCircle2, Timer 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const fetchAttendance = async () => {
    setLoading(true);
    const allRecords = await mockDb.getAttendance();
    if (user?.role === Role.EMPLOYEE) {
      setAttendance(allRecords.filter(r => r.employeeId === user.id));
    } else {
      setAttendance(allRecords);
    }
    setLoading(false);
  };

  // --- Stats Calculation ---
  const totalRecords = attendance.length;
  const presentCount = attendance.filter(r => r.status === 'Present').length;
  // Mock "Late" calculation (e.g., after 9:00 AM)
  const lateCount = attendance.filter(r => {
    const checkIn = new Date(r.checkInTime);
    return checkIn.getHours() >= 9 && checkIn.getMinutes() > 0;
  }).length;
  
  const totalHours = attendance.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);
  const avgHours = totalRecords > 0 ? (totalHours / totalRecords).toFixed(1) : '0';

  // --- Chart Data Preparation ---
  // Group by Date (Last 7 entries or days)
  const chartData = attendance.slice(0, 10).map(r => ({
    date: new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
    hours: r.durationHours || 0,
    status: r.status
  })).reverse();

  // Filter Logic for Table
  const filteredRecords = attendance.filter(record => {
    // For Admin: Default to today, or allow date clearing to see all. 
    // For visual template, let's show history by default if filterDate is empty or matched
    const matchesDate = user?.role === Role.ADMIN ? (filterDate ? record.date === filterDate : true) : true;
    const matchesName = record.employeeName.toLowerCase().includes(filterName.toLowerCase());
    return matchesDate && matchesName;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Overview</h2>
          <p className="text-slate-500">Track check-ins, working hours, and punctuality.</p>
        </div>
        {user?.role === Role.ADMIN && (
          <div className="flex items-center gap-2">
             <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-accent-500"
              />
          </div>
        )}
      </div>

      {/* Stats Cards (Template Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group">
          <div className="z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Entries</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalRecords}</h3>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500"></div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Avg. Hours</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{avgHours} <span className="text-sm font-normal text-slate-400">hrs</span></h3>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500"></div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Late Arrivals</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{lateCount}</h3>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500"></div>
        </div>

         {/* Card 4 */}
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden">
          <div className="z-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">On Time %</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">
              {totalRecords > 0 ? Math.round(((totalRecords - lateCount) / totalRecords) * 100) : 0}%
            </h3>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">Work Duration Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours >= 8 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mini List / Quick Actions */}
        <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-1">Work Schedule</h3>
            <p className="text-slate-400 text-sm mb-6">Standard Shift: 9:00 AM - 5:00 PM</p>
            
            <div className="space-y-4">
               <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg">
                 <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-slate-900">
                   <Timer size={16} strokeWidth={3} />
                 </div>
                 <div>
                   <p className="text-xs text-slate-400">Current Session</p>
                   <p className="font-bold">
                     {user?.role === Role.EMPLOYEE && attendance.find(r => r.date === new Date().toISOString().split('T')[0] && r.status === 'Present') 
                       ? 'Active Now' 
                       : 'Not Clocked In'}
                   </p>
                 </div>
               </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700">
             <div className="flex justify-between items-center mb-2">
               <span className="text-slate-400 text-sm">Weekly Target</span>
               <span className="font-bold text-accent-500">40 Hrs</span>
             </div>
             <div className="w-full bg-slate-700 rounded-full h-2">
               <div className="bg-accent-500 h-2 rounded-full" style={{width: '65%'}}></div>
             </div>
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-700">Attendance Records</h3>
           {user?.role === Role.ADMIN && (
             <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none"
                />
             </div>
           )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold">Date</th>
                {user?.role === Role.ADMIN && <th className="px-6 py-3 font-semibold">Employee</th>}
                <th className="px-6 py-3 font-semibold">Check In</th>
                <th className="px-6 py-3 font-semibold">Check Out</th>
                <th className="px-6 py-3 font-semibold">Duration</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No records found.</td></tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>
                    {user?.role === Role.ADMIN && (
                       <td className="px-6 py-4 font-bold text-slate-800">{record.employeeName}</td>
                    )}
                    <td className="px-6 py-4 text-slate-600">
                       {new Date(record.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                       {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {record.durationHours ? `${record.durationHours}h` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        record.status === 'Present' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

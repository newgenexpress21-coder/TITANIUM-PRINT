import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../services/mockDb';
import { WorkLog } from '../types';
import { Upload, CheckCircle, Clock, FileText } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [jobName, setJobName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [workDetails, setWorkDetails] = useState('');
  const [progress, setProgress] = useState(50);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const fetchLogs = async () => {
    if (!user) return;
    setLoading(true);
    const allLogs = await mockDb.getLogs();
    const myLogs = allLogs.filter(l => l.employeeId === user.id);
    setLogs(myLogs);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSuccessMsg('');

    try {
      let photoUrl = undefined;
      if (file) {
        photoUrl = await mockDb.uploadFile(file);
      }

      await mockDb.addLog({
        employeeId: user.id,
        employeeName: user.name,
        date: new Date().toISOString(),
        jobName,
        orderId,
        customerName,
        workDetails,
        progress,
        photoUrl
      });

      // Reset Form
      setJobName('');
      setOrderId('');
      setCustomerName('');
      setWorkDetails('');
      setProgress(50);
      setFile(null);
      setSuccessMsg('Work update submitted successfully!');
      
      // Refresh logs
      fetchLogs();
      
      // Clear success message after 3s
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (error) {
      console.error(error);
      alert('Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText size={18} />
                Submit Daily Work
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
                    <input
                      required
                      type="text"
                      value={jobName}
                      onChange={e => setJobName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                      placeholder="e.g. Brochure Printing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <input
                      required
                      type="text"
                      value={orderId}
                      onChange={e => setOrderId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                      placeholder="e.g. #12345"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    required
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                    placeholder="Client or Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Details</label>
                  <textarea
                    required
                    rows={3}
                    value={workDetails}
                    onChange={e => setWorkDetails(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-accent-500 focus:border-accent-500"
                    placeholder="Describe what you worked on..."
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Progress: {progress}%</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={e => setProgress(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Started</span>
                    <span>Halfway</span>
                    <span>Done</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {file ? (
                          <div className="flex items-center gap-2 text-green-600">
                             <CheckCircle size={24} />
                             <p className="text-sm font-medium">{file.name}</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> work photo</p>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                      />
                    </label>
                  </div>
                </div>

                {successMsg && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle size={16} />
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                >
                  {submitting ? 'Submitting...' : 'Submit Update'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={18} />
                Recent History
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-gray-500 text-sm text-center">Loading...</p>
              ) : logs.length === 0 ? (
                <p className="text-gray-400 text-sm text-center italic">No work logs yet.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm text-gray-900">{log.jobName}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.progress}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{new Date(log.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{log.workDetails}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
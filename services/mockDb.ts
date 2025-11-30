import { User, Role, WorkLog, AttendanceRecord } from '../types';

const USERS_KEY = 'lse_users';
const LOGS_KEY = 'lse_logs';
const ATTENDANCE_KEY = 'lse_attendance';

// Seed data if empty
const seedData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const initialUsers: User[] = [
      { id: '1', name: 'Admin Boss', email: 'admin@lion.com', role: Role.ADMIN, department: 'Management' },
      { id: '2', name: 'John Printer', email: 'john@lion.com', role: Role.EMPLOYEE, department: 'Printing' },
      { id: '3', name: 'Sarah Cutter', email: 'sarah@lion.com', role: Role.EMPLOYEE, department: 'Finishing' },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
  
  if (!localStorage.getItem(LOGS_KEY)) {
    const initialLogs: WorkLog[] = [
      {
        id: '101',
        employeeId: '2',
        employeeName: 'John Printer',
        date: new Date().toISOString(),
        jobName: 'Brochure Batch A',
        orderId: 'ORD-9921',
        customerName: 'Acme Corp',
        workDetails: 'Printed 5000 copies, waiting for drying.',
        progress: 80,
        createdAt: new Date().toISOString(),
      },
       {
        id: '102',
        employeeId: '3',
        employeeName: 'Sarah Cutter',
        date: new Date().toISOString(),
        jobName: 'Business Cards',
        orderId: 'ORD-9922',
        customerName: 'StartUp Inc',
        workDetails: 'Cutting completed. Packing now.',
        progress: 95,
        createdAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
  }

  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    const today = new Date().toISOString().split('T')[0];
    const initialAttendance: AttendanceRecord[] = [
      {
        id: 'a1',
        employeeId: '2',
        employeeName: 'John Printer',
        date: today,
        checkInTime: new Date(new Date().setHours(8, 55, 0, 0)).toISOString(),
        checkOutTime: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
        durationHours: 8.0,
        status: 'Present'
      },
      {
        id: 'a2',
        employeeId: '3',
        employeeName: 'Sarah Cutter',
        date: today,
        checkInTime: new Date(new Date().setHours(9, 15, 0, 0)).toISOString(),
        checkOutTime: undefined,
        durationHours: 0,
        status: 'Present'
      }
    ];
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(initialAttendance));
  }
};

// Call seed on load
seedData();

export const mockDb = {
  login: async (email: string): Promise<User | null> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email);
    return user || null;
  },

  getLogs: async (): Promise<WorkLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
  },

  addLog: async (log: Omit<WorkLog, 'id' | 'createdAt'>): Promise<WorkLog> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const logs: WorkLog[] = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const newLog: WorkLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog); // Add to top
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    return newLog;
  },

  getEmployees: async (): Promise<User[]> => {
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.filter(u => u.role === Role.EMPLOYEE);
  },

  addEmployee: async (name: string, email: string, department: string): Promise<User> => {
     await new Promise(resolve => setTimeout(resolve, 400));
     const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
     const newUser: User = {
       id: Math.random().toString(36).substr(2, 9),
       name,
       email,
       role: Role.EMPLOYEE,
       department
     };
     users.push(newUser);
     localStorage.setItem(USERS_KEY, JSON.stringify(users));
     return newUser;
  },

  uploadFile: async (file: File): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, this uploads to Supabase Storage.
    // Here we return a fake URL.
    return `https://picsum.photos/seed/${file.name}/400/300`;
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
  }
};
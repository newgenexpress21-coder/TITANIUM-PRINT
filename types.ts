export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string; // e.g., Printing, Finishing
}

export interface WorkLog {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // ISO date string
  jobName: string;
  orderId: string;
  customerName: string;
  workDetails: string;
  progress: number; // 0-100
  photoUrl?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD or ISO
  checkInTime: string; // ISO date string
  checkOutTime?: string; // ISO date string
  durationHours?: number;
  status: string;
}

export interface DashboardStats {
  totalJobs: number;
  avgProgress: number;
  completedToday: number;
  activeEmployees: number;
}
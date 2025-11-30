import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Sidebar } from './components/Sidebar';
import { Role } from './types';
import { Menu } from 'lucide-react';

// Simple router component
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading LION SMART...</div>;
  }

  if (!user) {
    return <Login />;
  }

  // Routing Logic
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return user.role === Role.ADMIN ? <AdminDashboard /> : <EmployeeDashboard />;
      case 'admin':
        return user.role === Role.ADMIN ? <AdminDashboard /> : <div className="flex h-full items-center justify-center text-gray-400">Access Denied</div>;
      case 'history':
        return user.role === Role.EMPLOYEE ? <EmployeeDashboard /> : <div className="flex h-full items-center justify-center text-gray-400">History View</div>;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar 
        activePage={currentPage} 
        navigate={setCurrentPage} 
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-accent-500 rounded flex items-center justify-center font-bold text-white">L</div>
             <span className="font-bold text-gray-900">LION SMART</span>
          </div>
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-10">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
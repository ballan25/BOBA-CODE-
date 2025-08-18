// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDatabaseStatus } from './hooks/useDatabase';
import ErrorBoundary from './components/ErrorBoundary';
import DatabaseSetup from './components/DatabaseSetup';
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import ScrollToTop from './components/ScrollToTop';

// Import your existing pages
import PaymentProcessing from './pages/payment-processing-and-checkout';
import AdminDashboard from './pages/admin-sales-dashboard-and-analytics';
import NotFound from './pages/NotFound';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { status: dbStatus, lastCheck } = useDatabaseStatus();

  // Check if database is ready
  useEffect(() => {
    // Give some time for the database status check to complete
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show database setup if database is not ready
  if (isInitializing || dbStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Show setup component if database is not healthy
  if (dbStatus !== 'healthy') {
    return <DatabaseSetup />;
  }

  // Main app layout
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Main Content */}
          <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
            {/* Header */}
            <Header 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              dbStatus={dbStatus}
              lastDbCheck={lastCheck}
            />
            
            {/* Page Content */}
            <main className="pt-16">
              <Routes>
                {/* Default redirect to payment processing */}
                <Route path="/" element={<Navigate to="/pos" replace />} />
                
                {/* POS System Routes */}
                <Route 
                  path="/pos" 
                  element={<PaymentProcessing />} 
                />
                
                {/* Admin Dashboard Routes */}
                <Route 
                  path="/dashboard" 
                  element={<AdminDashboard />} 
                />
                
                {/* Additional routes can be added here */}
                <Route 
                  path="/reports" 
                  element={<AdminDashboard />} 
                />
                
                <Route 
                  path="/analytics" 
                  element={<AdminDashboard />} 
                />
                
                {/* 404 Page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>

          {/* Database Status Indicator (bottom right) */}
          <DatabaseStatusIndicator status={dbStatus} lastCheck={lastCheck} />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

// Database status indicator component
const DatabaseStatusIndicator = ({ status, lastCheck }) => {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    healthy: { color: 'bg-green-500', text: 'Online' },
    checking: { color: 'bg-yellow-500', text: 'Checking' },
    unhealthy: { color: 'bg-red-500', text: 'Offline' },
    error: { color: 'bg-red-500', text: 'Error' }
  };

  const config = statusConfig[status] || statusConfig.error;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="relative"
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {/* Status Indicator */}
        <div className={`${config.color} rounded-full p-2 shadow-lg cursor-pointer`}>
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>

        {/* Details Tooltip */}
        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg p-3 min-w-48 border">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Database Status
            </div>
            <div className={`text-sm font-medium mb-2 ${
              status === 'healthy' ? 'text-green-600' : 
              status === 'checking' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {config.text}
            </div>
            {lastCheck && (
              <div className="text-xs text-gray-500">
                Last check: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { getDefaultRoute, isAuthenticated } from './api/auth';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';       
import ReceiptPage from './pages/ReceiptPage';
import ClientReceiptPage from './pages/ClientReceiptPage';
import ReportPrintPage from './pages/ReportPrintPage';
import AgentDashboard from './pages/AgentDashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. LOGIN ROUTE */}
        {/* If user is already logged in, redirect them to Dashboard immediately */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} 
        />

        {/* 2. PROTECTED ROUTES (Private) */}
        <Route element={<PrivateRoutes />}>
          {/* The Dashboard now contains both Transactions and Clients via Tabs */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/agent" element={<AgentDashboard />} />
          <Route path="/agent/report" element={<AgentDashboard />} />
          <Route path="/receipt/:receiptId" element={<ReceiptPage />} />
          <Route path="/client-receipt/:receiptId" element={<ClientReceiptPage />} />
          <Route path="/report/:reportId" element={<ReportPrintPage />} />
        </Route>

        {/* 3. FALLBACK - Redirect any unknown URL to Dashboard */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Security Wrapper
const PrivateRoutes = () => {
  const isAuth = isAuthenticated();
  
  // If not logged in, kick to login page
  if (!isAuth) return <Navigate to="/login" replace />;
  
  // If logged in, render the child route (Dashboard)
  // We removed <Layout> here so there is NO SIDEBAR, just your new full-width Dashboard.
  return <Outlet />;
};

export default App;

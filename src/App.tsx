import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from './api/auth';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';       

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. LOGIN ROUTE */}
        {/* If user is already logged in, redirect them to Dashboard immediately */}
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />} 
        />

        {/* 2. PROTECTED ROUTES (Private) */}
        <Route element={<PrivateRoutes />}>
          {/* The Dashboard now contains both Transactions and Clients via Tabs */}
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* 3. FALLBACK - Redirect any unknown URL to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
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

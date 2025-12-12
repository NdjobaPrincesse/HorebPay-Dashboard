import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from './api/auth';

// Layout
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';       
import ClientsPage from './pages/ClientsPage';           
import TransactionsPage from './pages/TransactionsPage'; 

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />

        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 1. OVERVIEW */}
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* 2. CLIENTS MANAGEMENT */}
          <Route path="/clients" element={<ClientsPage />} />
          
          {/* 3. FINANCIAL HISTORY */}
          <Route path="/transactions" element={<TransactionsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

const PrivateLayout = () => {
  const isAuth = isAuthenticated();
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Layout><Outlet /></Layout>;
};

export default App;

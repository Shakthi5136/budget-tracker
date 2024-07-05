

import { BalanceProvider } from './pages/balance_context/BalanceContext';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './pages/login';
import HomePage from './pages/home';
import Layout from './pages/Layout';
import Income from './pages/income';
import Budget from './pages/budget';
import AdminLoginPage from './pages/admin_login';
import AdminDashboard from './pages/admin_dashboard';
import AdminSignupPage from './pages/admin_signup';
import Transaction from './pages/transaction';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Adduser from './pages/home/AddUser';

function App() {
  return (
    <GoogleOAuthProvider clientId="218641895319-t22icvpfi817oa6os7k2bccjguemcese.apps.googleusercontent.com">
      <BalanceProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/signup" element={<AdminSignupPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route element={<Layout />}>
              <Route path="home" element={<HomePage />} />
              <Route path="users" element={<Adduser />} />
              <Route path="transaction" element={<Transaction />} />
              <Route path="income" element={<Income />} />
              <Route path="budget" element={<Budget />} />
            </Route>
          </Routes>
        </Router>
      </BalanceProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

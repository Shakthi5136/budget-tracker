// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginPage from './pages/login';
import HomePage from './pages/home';
import Layout from './pages/Layout';
import Expenses from './pages/expense';
import Income from './pages/income';
import Budget from './pages/budget';
import AdminLoginPage from './pages/admin_login';
import AdminDashboard from './pages/admin_dashboard';
import AdminSignupPage from './pages/admin_signup';
function App() {
  return (
    <GoogleOAuthProvider clientId="218641895319-t22icvpfi817oa6os7k2bccjguemcese.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/signup" element={<AdminSignupPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route element={<Layout />}>
            <Route path="home" element={<HomePage />} />
            <Route path="expense" element={<Expenses/>}/>
            <Route path="income" element={<Income/>}/>
            <Route path="budget" element={<Budget/>}/>
          </Route>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

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

function App() {
  return (
    <GoogleOAuthProvider clientId="218641895319-t22icvpfi817oa6os7k2bccjguemcese.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
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

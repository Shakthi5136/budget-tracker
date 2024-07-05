import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import logo from '../../assets/logo.png';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('adminToken', token); // Store JWT token
        navigate('/admin/dashboard'); // Navigate to admin dashboard
      } else {
        console.error('Admin login failed');
      }
    } catch (error) {
      console.error('Error logging in admin', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <img src={logo} alt="logo" className="logo" />
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn login-btn">
              Admin Login
            </button>
          </form>
          <button onClick={() => navigate('/admin/signup')} className="btn switch-btn">
            Admin Signup
          </button>
        </div>
      </div>
      <div className="login-right">
        <h1>Welcome to Expense Ease</h1>
        <p>Login to Access Admin Dashboard</p>
      </div>
    </div>
  );
};

export default AdminLoginPage;

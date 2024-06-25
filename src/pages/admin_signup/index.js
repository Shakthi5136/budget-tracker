import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss'; // Import your admin signup styles
import adminLogo from '../../assets/adminLogo.png'; // Adjust the logo path if needed

const AdminSignupPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secret, setSecret] = useState('');
  const [picture, setPicture] = useState(''); // If you have a profile picture upload

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://localhost:3002/api/admin/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, name, email, password, secret, picture }),
      });
      const data = await response.json(); // Parse response as JSON
      if (response.ok) {
        localStorage.setItem('adminId', id);
        navigate('/admin/dashboard', { state: { adminId: id } });
      } else {
        console.error('Admin signup failed:', data.error || data.message); // Log error message from backend
      }
    } catch (error) {
      console.error('Error signing up admin:', error);
    }
  };
  

  return (
    <div className="admin-signup-container">
      <div className="admin-signup-left">
        <div className="admin-signup-form">
          <img src={adminLogo} alt="Admin Logo" className="admin-logo" />
          <form onSubmit={handleAdminSignup}>
            <div className="form-group">
              <label>Admin ID:</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div className="form-group">
              <label>Confirm Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Secret Code:</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />
            </div>
            {/* Optional: Add a field for profile picture upload */}
            {/* <div className="form-group">
                  <label>Profile Picture:</label>
                  <input
                    type="file"
                    onChange={(e) => handlePictureUpload(e.target.files[0])}
                  />
                </div> */}
            <button type="submit" className="btn admin-signup-btn">
              Sign Up
            </button>
          </form>
        </div>
      </div>
      <div className="admin-signup-right">
        <h1>Welcome Admin</h1>
        <p>Sign up to Create Your Admin Account</p>
      </div>
    </div>
  );
};

export default AdminSignupPage;

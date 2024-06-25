import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Remove JWT token on logout
    navigate('/admin/login'); // Navigate to admin login page
  };

  return (
    <div>
      <h1>Welcome to Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboardPage;

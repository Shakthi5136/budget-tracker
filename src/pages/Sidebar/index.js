import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBars,
  faClose,
  faMoneyCheckDollar,
  faMoneyBillTransfer,
  faSignOutAlt,
  faWallet,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import './index.scss';
import Loader from 'react-loaders';

const Sidebar = () => {
  const [showNav, setShowNav] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      localStorage.setItem('userId', userId);
      const fetchUserData = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/user/${userId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setUserData(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setLoading(false);
      setError('No user ID provided');
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="nav-bar">
      <div className='user-info'>
        {userData ? (
          <>
            <img src={userData.picture} alt="User Profile" />
            <p>{userData.name}</p>
            <p>{userData.email}</p>
          </>
        ) : (
          <p>No user data available</p>
        )}
      </div>
      <nav className={showNav ? 'mobile-show' : ''}>
        <NavLink 
          exact
          activeClassName="active"
          to="/home"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faUser} color="var(--secondary-color)" />
        </NavLink>
        <div className="user-sub">
          <NavLink 
            className="user-link"
            to="/users"
            onClick={() => setShowNav(false)}
          >
            ADD USER
          </NavLink>
        </div>
       
        <NavLink
          activeClassName="active"
          className="income-link"
          to="/income"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faMoneyCheckDollar} color="var(--secondary-color)" />
        </NavLink>

        <NavLink
          activeClassName="active"
          className="budget-link"
          to="/budget"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faWallet} color="var(--secondary-color)" />
        </NavLink>

        <NavLink 
          activeClassName="active"
          className="transaction-link"
          to="/transaction"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faMoneyBillTransfer} color="var(--secondary-color)" />
        </NavLink>  

        <NavLink
          activeClassName="active"
          className="report-link"
          to="/report"
          onClick={() => setShowNav(false)}
        >
          <FontAwesomeIcon icon={faWallet} color="var(--secondary-color)" />
        </NavLink>

        <FontAwesomeIcon 
          onClick={() => setShowNav(false)}
          icon={faClose}
          color="var(--secondary-color)"
          size="3x"
          className='close-icon' 
        />
      </nav>
      <div className="logout">
        <NavLink
          to="/"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} color="var(--secondary-color)" />
          <span>Logout</span>
        </NavLink>
      </div>
      <FontAwesomeIcon 
        onClick={() => setShowNav(true)}
        icon={faBars}
        color="var(--secondary-color)"
        size="3x"
        className='hamburger-icon' 
      />
       <Loader type="ball-spin-fade-loader" />
    </div>
  );
};

export default Sidebar;

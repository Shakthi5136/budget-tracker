import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Fixed import statement
import './index.scss';
import logo from '../../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const storeUserData = async (userData) => {
    try {
      const response = await fetch('http://localhost:3001/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        console.log('User data stored successfully');
      } else {
        console.error('Error storing user data');
      }
    } catch (error) {
      console.error('Error storing user data', error);
    }
  };

  const handleGoogleLoginSuccess = (credentialResponse) => {
    const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
    const userData = {
      id: credentialResponseDecoded.sub,
      name: credentialResponseDecoded.name,
      email: credentialResponseDecoded.email,
      picture: credentialResponseDecoded.picture,
    };
    localStorage.setItem('userId', credentialResponseDecoded.sub);
    storeUserData(userData);
    navigate('/home', { state: { userId: credentialResponseDecoded.sub } });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const userData = {
      id: email, // Using email as the id for simplicity
      name: username,
      email: email,
      password: password,
      picture: '', // No picture for normal signup
    };
    localStorage.setItem('userId', email);
    await storeUserData(userData);
    navigate('/home', { state: { userId: email } });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('userId', userData.id);
        navigate('/home', { state: { userId: userData.id } });
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error logging in', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <img src={logo} alt="logo" className="logo" />
          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            {!isLogin && (
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
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
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            className="google-login-btn"
          />
          <button onClick={() => setIsLogin(!isLogin)} className="btn switch-btn">
            {isLogin ? 'Create an Account' : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
      <div className="login-right">
        <h1>Welcome to Expense Ease</h1>
        <p>Login to Access Dashboard</p>
      </div>
    </div>
  );
};

export default LoginPage;

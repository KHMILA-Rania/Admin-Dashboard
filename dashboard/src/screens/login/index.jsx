import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css'; 

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = response.data.data.user;
         const token = response.data.data.token;
        if (userData.role.some(role => role.name === 'admin')) {
          localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem("token", token);
          navigate('/dashboard/dash');
        } else {
          setErrorMessage('You are not authorized to access this page.');
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div className="admin-login-container">
       
      {/* Centered Login Card */}
      <div className="admin-login-card">
        {/* Logo & Title (Centered) */}
        <div className="text-center">
          <img 
            src={require('./voltwiseBlack.png')} 
            alt="Logo" 
            className="logo h-10 w-5 mx-auto mb-4" 
          />
          <h2 className="admin-login-title ">Admin Login</h2>
          <p className="admin-login-subtitle">Enter your credentials to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-input">Email</label>
            <input
              type="email"
              className="admin-login-input "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="text-input">Password</label>
            <input
              type="password"
              className="admin-login-input "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/*  Button */}
          <button
         
            type="submit"
            disabled={isLoading}
            className="admin-login-button flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin  mr-2 text-white" style={{ width: '2rem', height: '2rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Error Message */}
        {errorMessage && (
          <div className="admin-login-error">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
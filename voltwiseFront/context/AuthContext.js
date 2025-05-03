import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import GLOBALS from '../global/variables'; // Adjust the import path as necessary



const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Make the API call here
      const response = await axios.post(`http://${GLOBALS.IP}:3000/auth/login`, {
        email,
        password,
      });

      // Assuming response.data contains a token or user info
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token); // Save the token to localStorage (or in state)
        setUser(response.data.user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

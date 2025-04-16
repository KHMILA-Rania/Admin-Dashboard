import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../global/variables';

const API_URL = `http://${GLOBALS.IP}:3000/auth`;

const AuthService = {
  // Login function
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.status === 'ok' || response.data.status === 200) {
        const token = response.data.data;
        const userType = response.data.userType;
        
        // Store data in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
        await AsyncStorage.setItem('userType', userType);

        return { success: true, token, userType };
      } else {
        return { success: false, message: 'Login failed. Please check your credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login. Please try again.' };
    }
  },

  // Fetch User by ID
  getUserById: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'No token found' };
      }

      const userId = await AsyncStorage.getItem('userId'); // Assuming you store userId in AsyncStorage

      if (!userId) {
        return { success: false, message: 'No user ID found' };
      }

      const response = await axios.get(`http://${GLOBALS.IP}:3000/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { success: true, user: response.data };
    } catch (error) {
      console.error('Fetch user error:', error);
      return { success: false, message: 'Failed to fetch user data' };
    }
  },

  // Logout function
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('userType');
    await AsyncStorage.removeItem('userId'); // Remove userId too
  },
};

export default AuthService;

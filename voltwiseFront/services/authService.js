import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../global/variables';

const API_URL = `http://${GLOBALS.IP}:3000/auth`;

const AuthService = {
  loginx: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password: password.trim(),
      });
  
// Check the full response
  
      if (response.data.status === 'ok' || response.data.status === 200) {
        const userData = response.data.data;
        const userId = userData._id;  // Extract userId
        console.log('User ID:', userId);  // Explicitly log the user ID
  
        const token = userData.token || '';
        const userType = userData.role[0]?.name || 'user';
  
        // Store necessary data in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userType', userType);
        await AsyncStorage.setItem('userId', userId);  // Store userId
        await AsyncStorage.setItem('userData', JSON.stringify(userData));  // Optionally store the full user data
  
        return { success: true, token, userId };
      } else {
        return { success: false, message: 'Login failed. Please check your credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login. Please try again.' };
    }
  }
  
,  
login: async (email, password) => {
  try {
    
    const response = await axios.post(`${API_URL}/login`, {
      email: email.trim(),
      password: password.trim(),
    });

    console.log('Response Data:', response.data);

    if (response.data.status === 'ok' || response.data.status === 200) {
      // ✅ FIX: Correctly extract token and user
      const  token= response.data.data.token;
      const user = response.data.data.user;  // Ensure this is the correct path to user data

      if (!user?._id) {
        console.error("User object is missing _id!");
        return { success: false, message: "Login failed: user ID missing." };
      }

      const userId = user._id;
   
      const userType = user.role?.[0]?.name || 'user';

      // ✅ Store token and user info
      await AsyncStorage.setItem('token', token);
      console.log('Token stored:', token);
      console.log( response.data.data.token)
      await AsyncStorage.setItem('user', user); 
      console.log('user', user)
     await asyncStorage.setItem('userData', JSON.stringify(user)); // Store user data as a string
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('userType', userType);
      await AsyncStorage.setItem('userId', userId);  // ✅ no longer undefined

      console.log('Logged in successfully');
      console.log('User ID:', userId);

      return { success: true, token, userId };
    } else {
      return { success: false, message: 'Login failed.' };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'An error occurred during login.' };
  }
}

,

  getUserById: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          return { success: true, user: JSON.parse(userData) };
        }
        return { success: false, message: 'Token or User ID not found' };
      }

      const response = await axios.get(`http://${GLOBALS.IP}:3000/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await AsyncStorage.setItem('userData', JSON.stringify(response.data));

      return { success: true, user: response.data };
    } catch (error) {
      console.error('Fetch user error:', error);
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        return { success: true, user: JSON.parse(userData) };
      }
      return { success: false, message: 'Failed to fetch user data' };
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'isLoggedIn', 'userType', 'userId', 'userData']);
  },
};

export default AuthService;

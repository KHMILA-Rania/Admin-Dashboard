import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import style from '../style';

const HomeUser = ({ navigation }) => {
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('token'); // Retrieve token data
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUserName(userData.name || 'User');
          const storedUserType = await AsyncStorage.getItem('userType');
          setUserType(storedUserType || 'user');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Clears all stored data
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }], // Redirect to sign-in after logout
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')} // Add a beautiful background image
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.complaint} onPress={()=>navigation.navigate('Complaint')}>
          <Text style={styles.logoutText}>Complaint</Text>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.header}>
          <Image source={require('../../assets/voltwiselogo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome, {userName}!</Text>
          <Text style={styles.subtitle}>You are logged in as: {userType}</Text>
        </View>

        {/* Extra Image or Content */}
        <View style={styles.extraContent}>
          <Image source={require('../../assets/extra.jpg')} style={styles.extraImage} />
          <Text style={styles.extraText}>Explore more features and enjoy our app!</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  complaint:{
    top:30,
    right: 20,
    marginRight:35,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  logoutButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
 
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginTop: 100, // Adjust for better positioning
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D9CDB',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#34495E',
    marginBottom: 20,
  },
  extraContent: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  extraImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
    borderRadius: 15,
  },
  extraText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default HomeUser;

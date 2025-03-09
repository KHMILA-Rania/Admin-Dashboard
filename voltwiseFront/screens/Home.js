import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Home = ({ navigation }) => {
    
    const [userName, setUserName] = useState('');
    return(
        <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome, {userName || 'Guest'} 👋</Text>
  
        <Image source={require('../assets/home-bg.png')} style={styles.image} />
  
        <View style={styles.card}>
          <Text style={styles.cardText}>Quick Access</Text>
          <TouchableOpacity
            style={styles.button}
            >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#e74c3c' }]}
            onPress={() => alert('Logout functionality soon')}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    welcomeText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    image: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    card: {
      width: '90%',
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
      elevation: 3,
    },
    cardText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#555',
    },
    button: {
      width: '100%',
      padding: 12,
      backgroundColor: '#3498db',
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  

export default Home;
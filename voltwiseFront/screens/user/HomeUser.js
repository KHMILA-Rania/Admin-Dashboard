import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Dimensions, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const { height } = Dimensions.get('window');

const HomeUser = ({ navigation }) => {
  const [userType, setUserType] = useState('user');
  const [userName, setUserName] = useState('User');
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Component mounted');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        if (storedToken) {
          const userData = JSON.parse(storedToken);
          setUserName(userData?.name || 'User');
          console.log('User name:', userData?.name);
        }
        if (storedUserType) {
          setUserType(storedUserType);
          console.log('User type:', storedUserType);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    initialize();
    
    // Configure geolocation
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });
    
    // Get user location
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
        console.log('Location fetched:', latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
        setLoading(false);
        // Use default location if we can't get the user's location
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Using default location instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={styles.background}
      >
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.complaintButton} onPress={() => navigation.navigate('Complaint')}>
          <Text style={styles.logoutText}>Complaint</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image source={require('../../assets/voltwiselogo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome, {userName}!</Text>
          <Text style={styles.subtitle}>You are logged in as: {userType}</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onError={(e) => console.error('Map error:', e.nativeEvent)}
          >
            <Marker 
              coordinate={region} 
              title="Your Location" 
              description="You are here"
            />
          </MapView>
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={getUserLocation}
        >
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  logoutButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    zIndex: 1,
  },
  complaintButton: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    zIndex: 1,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.15,
    marginBottom: height * 0.05,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D9CDB',
  },
  subtitle: {
    fontSize: 18,
    color: '#34495E',
    marginTop: 5,
  },
  mapContainer: {
    height: 400,
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D9CDB',
  },
  refreshButton: {
    alignSelf: 'center',
    backgroundColor: '#2D9CDB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeUser;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Dimensions } from 'react-native';
import { ScrollView } from 'react-native';

const HomeUser = ({ navigation }) => {
  const [userType, setUserType] = useState('');
  const [userName, setUserName] = useState('');
  const [region, setRegion] = useState(null);

  useEffect(() => {
    console.log('Component mounted');
  }, []);

  useEffect(() => {
    setRegion({
      latitude: 37.7749, // Default latitude
      longitude: -122.4194, // Default longitude
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  
  }, []);
  
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
    }

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
  
 

  console.log('Default region set.');





  useEffect(() => {
    console.log('Region state updated:', region); // Debug log
  }, [region]);


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'We need your location to show the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      console.log('Android permission granted:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      console.log('iOS permission result:', result);
      return result === RESULTS.GRANTED;
    }
  };

  return (
    <ScrollView
    contentContainerStyle={{flexGrow: 1}}
    keyboardShouldPersistTaps={'always'}>
    <ImageBackground
      source={require('../../assets/background.jpg')} // Add a beautiful background image
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.complaint} onPress={() => navigation.navigate('Complaint')}>
          <Text style={styles.logoutText}>Complaint</Text>
        </TouchableOpacity>

        {/* Main Content */}
        <View style={styles.header}>
          <Image source={require('../../assets/voltwiselogo.png')} style={styles.logo} />
          <Text style={styles.title}>Welcome, {userName||"user" }!</Text>
          <Text style={styles.subtitle}>You are logged in as: {userType || "user"}</Text>
        </View>

{ console.log('Rendering MapView with region:', region) }

{(!region || !region.latitude || !region.longitude || !region.latitudeDelta || !region.longitudeDelta) && (
  <>
    {console.error('Invalid region object:', region)}
    <Text style={{ color: 'red', marginTop: 20 }}>
      Unable to load map due to invalid region data.
    </Text>
  </>
)}
  


  <View style={styles.map}>
  {region && region.latitude && region.longitude && region.latitudeDelta && region.longitudeDelta ? (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFillObject}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <Marker
        coordinate={{
          latitude: region.latitude,
          longitude: region.longitude,
        }}
        title="You're here"
        description="Current Location"
      />
    </MapView>
      ) : (
        <Text style={{ color: 'black', marginTop: 20 }}>Loading map or invalid region data...</Text>
      )}
    </View>



        {/* Extra Image or Content 
        <View style={styles.extraContent}>
          <Image source={require('../../assets/extra.jpg')} style={styles.extraImage} />
          <Text style={styles.extraText}>Explore more features and enjoy our app!</Text>
        </View>*/}

<View>
        {Array.from({ length: 20 }).map((_, index) => (
          <Text key={index} style={{ marginVertical: 10, textAlign: 'center' }}>
            Dummy Content {index + 1}
          </Text>
        ))}
      </View>
      </View>
    </ImageBackground>
</ScrollView>
  );
};

const { height } = Dimensions.get('window');

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
  complaint: {
    top: 30,
    right: 20,
    marginRight: 35,
    backgroundColor: 'gray',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
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
    shadowColor: '#000',
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
    marginTop: height * 0.1, // 10% of screen height
    marginBottom: height * 0.03, // 3% of screen height
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
  map: {
    width: '100%',
    height: 400,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'gray',
  },
});

export default HomeUser;
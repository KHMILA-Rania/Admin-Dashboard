import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Dimensions, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import CustomBottomBar from './customBottomBar';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

const { height } = Dimensions.get('window');

const HomeUser = ({ navigation }) => {
 
  const [userType, setUserType] = useState('user');
  const [userName, setUserName] = useState('User');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userID, setUserID] = useState(''); // State to hold user ID
  
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);



  
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Component mounted');
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserID(storedUserId); 
        console.log("userid in async storage : ", userID)// Set user ID from AsyncStorage
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

  const lightMapStyle = [

    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "weight": "2.00"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#9c9c9c"
          }
      ]
  },
  {
      "featureType": "all",
      "elementType": "labels.text",
      "stylers": [
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
          {
              "color": "#f2f2f2"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
          {
              "saturation": -100
          },
          {
              "lightness": 45
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#eeeeee"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#7b7b7b"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
          {
              "color": "#46bcec"
          },
          {
              "visibility": "on"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#c8d7d4"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "color": "#070707"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "color": "#ffffff"
          }
      ]
  }
]

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#17263c"}]
  }
];



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
    
       

     

        <View style={styles.header}>
          
            
           
                <Image source={require('../../assets/logop-blue.png')} style={styles.logo} />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
        </View>

        <View style={styles.titles}>
        <Text style={styles.title}>Welcome, {userName}!</Text>
       
        </View>



<View style={{flex:1, position:'relative'}}>
        
        
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
        <CustomBottomBar style={styles.customBottomBar} />
      
        </View>
     
    </View>
  );
};

const styles = StyleSheet.create({
  titles:{
    alignItems: 'center',  // Center align the titles
    marginTop: 0,  // Give space below the header
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#E4F4FF',
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'flex-start', 
  },
  logoutButton: {
    backgroundColor: '#39B2DB', // Light green color
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#91a6a2', // Darker green for border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 5, // For Android shadow
    alignItems: 'center',
    marginLeft: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between', // Puts logo left and logout button right
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    width: '100%',
  },
  logo: {
    width: 50,
    height: 50,
   
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#223958',
    marginBottom: 5,
    textAlign: 'center', // Center align the title
  },
  subtitle: {
    fontSize: 18,
    color: '#34495E',
    marginTop: 5,
    textAlign: 'center', 
  },
  mapContainer: {
    flex: 1,           // Takes all available space
    marginTop: 10,     // Space below header
    marginBottom: 15,  // Matches bottom bar height
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
  customBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,  // Adjust the height as needed
    backgroundColor: '#fff',
    // Ensure the bottom bar is on top
  },
});

export default HomeUser;
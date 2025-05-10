import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';  // Make sure axios is imported!
import CustomBottomBar from './customBottomBar';
import GLOBALS from '../../global/variables'; // Adjust the path as necessary
import { useRef } from 'react';

const { height } = Dimensions.get('window');

const HomeUser = ({ navigation }) => {
  const [userType, setUserType] = useState('user');
  const [userName, setUserName] = useState('User');
  const [userID, setUserID] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserID(storedUserId);
        console.log('User ID:', storedUserId);

        if (storedToken) {
          const userData = JSON.parse(storedToken);
          setUserName(userData?.name || 'User');
        }
        if (storedUserType) {
          setUserType(storedUserType);
        }

        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
        });

        getUserLocation();
        fetchStations();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    initialize();
  }, []);

  const fetchStations = async () => {
    try {
      setLoadingStations(true);
      const response = await axios.get(`http://${GLOBALS.IP}:3000/station`);
      setStations(response.data);
     
    } catch (error) {
      console.error('Error fetching stations:', error);
      Alert.alert('Error', 'Failed to load stations.');
    } finally {
      setLoadingStations(false);
    }
  };

  const reserveStation = async (stationId) => {
    try {
        const response = await axios.patch(`http://${GLOBALS.IP}:3000/station/reserve/${stationId}`, {
            userId: userID, // Assuming userID is available in your state or storage
        });
        Alert.alert('Reservation Successful', response.data.message);
        fetchStations(); 
      } catch (error) {
        console.error('Error reserving station:', error);

        // Check if error response is available
        if (error.response) {
            // Server responded with a status other than 2xx
            const errorMessage = error.response.data.message || 'An error occurred while reserving the station.';
            Alert.alert('Reservation Failed', errorMessage);
        } else if (error.request) {
            // No response was received from the server
            Alert.alert('Reservation Failed', 'No response from the server. Please check your internet connection.');
        } else {
            // Error occurred in setting up the request
            Alert.alert('Reservation Failed', 'An unexpected error occurred. Please try again later.');
        }
    }
};



  const getUserLocation = () => {
    
    setLoadingLocation(true);

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.log('Location error:', error);
        setLoadingLocation(false);
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Using default location instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleStationPress = (station) => {
    setSelectedStation(station);
    setModalVisible(true); // Show modal on station press
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

  const closeModal = () => {
    setModalVisible(false); // Close the modal
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

      <View style={{ flex: 1 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={region}
            title="Your Location"
            description="You are here"
            pinColor="red"
          />

          {/* Render stations dynamically */}
          {stations.map((station) => (
            <Marker
              key={station._id}  // Assuming MongoDB ID; adjust if different
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              pinColor="green"
              onPress={() => handleStationPress(station)} // Show modal when pressed
            >
              <View style={{
                backgroundColor: 'blue',
                padding: 8,
                borderRadius: 20,
                borderColor: 'white',
                borderWidth: 2,
              }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>⚡</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        <TouchableOpacity style={styles.refreshButton} onPress={getUserLocation}>
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>

        {/* Modal for displaying station information */}
        {selectedStation && (
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedStation.name}</Text>
                <Text style={styles.modalDescription}>{`Location: ${selectedStation.location}`}</Text>
                <Text style={styles.modalDescription}>{`Capacity: ${selectedStation.capacity}`}</Text>
                <Text style={styles.modalDescription}>{`Available Slots: ${selectedStation.availableSlots}`}</Text>
                <Text style={styles.modalDescription}>{`Reserved ?: ${selectedStation.isReserved}`}</Text>
                <Text style={styles.modalDescription}>{`State : ${selectedStation.state}`}</Text>
                
                <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                        setModalVisible(false);  // Close the modal
                        navigation.navigate('StationList'); // Navigate to station details page
                    }}
                >
                    <Text style={styles.modalButtonText}>View Stations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                        reserveStation(selectedStation._id); // Call your reserve function here
                    }}
                >
                    <Text style={styles.modalButtonText}>Reserve Station</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                  <Text style={styles.closeModalText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        <CustomBottomBar style={styles.customBottomBar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E4F4FF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
  },
  logo: { width: 50, height: 50 },
  logoutButton: {
    backgroundColor: '#39B2DB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  logoutText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  titles: { alignItems: 'center', marginTop: 0 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#223958' },
  map: { flex: 1 },
  refreshButton: {
    alignSelf: 'center',
    backgroundColor: '#2D9CDB',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginVertical: 10,
  },
  refreshButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  calloutView: { width: 150 },
  calloutTitle: { fontWeight: 'bold', fontSize: 14 },
  calloutDescription: { fontSize: 12 },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: '#2D9CDB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#2D9CDB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 5,
},
modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
},
});

export default HomeUser;

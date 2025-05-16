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
    latitude: 36.895666,
    longitude: 10.1808403,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [activeReservation, setActiveReservation] = useState(null);
const [reservationEndTime, setReservationEndTime] = useState(null);
const [timeLeft, setTimeLeft] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state

  
  
  
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
    const response = await axios.post(
      `http://${GLOBALS.IP}:3000/reservation/${stationId}/reserve`,
      { userId: userID }
    );

    Alert.alert('Reservation Successful', response.data.message);
    // Set both the active reservation and end time
    setActiveReservation(response.data.reservation);
    console.log('Active reservation state:', response.data.reservation);
    setReservationEndTime(new Date(response.data.reservation.endTime));
    fetchStations(); // Refresh station data
  } catch (error) {
    console.error('Error reserving station:', error);
    if (error.response) {
      Alert.alert('Reservation Failed', error.response.data.message || 'Failed to reserve station');
    } else {
      Alert.alert('Error', 'Could not connect to server');
    }
  }
};




useEffect(() => {
  let timer;

  if (reservationEndTime) {
    timer = setInterval(() => {
      const now = new Date();
      const diff = reservationEndTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft('Expired');
        setActiveReservation(null);
        setReservationEndTime(null);
        fetchStations(); // Refresh to update station availability
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);
  }

  return () => clearInterval(timer);
}, [reservationEndTime]);

   const extendReservation = async (reservationId) => {
  try {
    const response = await axios.patch(
      `http://${GLOBALS.IP}:3000/reservation/${reservationId}/extend`,
      { userId: userID }
    );

    Alert.alert('Reservation Extended', response.data.message);
    setActiveReservation(response.data.reservation);
    setReservationEndTime(new Date(response.data.reservation.endTime));
    fetchStations();
  } catch (error) {
    console.error('Error extending reservation:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to extend reservation');
  }
};
  

const freeStation = async (reservationId) => {
  try {
    console.log('Calling freeStation with reservationId:', reservationId);

    const response = await axios.patch(
      `http://${GLOBALS.IP}:3000/reservation/${reservationId}/cancel`,
      { userId: userID }
    );

    console.log('Free station response:', response.data);

    Alert.alert('Station Freed', response.data.message);

    // Clear local reservation data
    setActiveReservation(null);
    setReservationEndTime(null);
    setSelectedStation(null);
    setModalVisible(false);

    // Wait for stations to refresh, and ensure it updates correctly
    await fetchStations();

  } catch (error) {
    console.error('Error freeing station:', error);

    let errorMessage = 'Failed to free station';

    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;

      if (
        error.response.status === 400 &&
        error.response.data.message.includes('already ended')
      ) {
        // Reservation already expired, clear local state
        setActiveReservation(null);
        setReservationEndTime(null);
        await fetchStations();
      }
    }

    Alert.alert('Error', errorMessage);
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
        {reservationEndTime && (
  <View style={styles.timerBanner}>
    <Text style={styles.timerText}>Time left: {timeLeft}</Text>
  </View>
)}
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

{activeReservation && activeReservation.stationId === selectedStation._id && activeReservation.status === 'active' ? (
  <>
    <TouchableOpacity
      style={styles.modalButton}
      onPress={() => extendReservation(activeReservation._id)}
    >
      <Text style={styles.modalButtonText}>Extend Reservation</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.modalButton, { backgroundColor: '#FF5C5C' }]}
      onPress={() => freeStation(activeReservation._id)}
    >
      <Text style={styles.modalButtonText}>Free Station</Text>
    </TouchableOpacity>
  </>
) : activeReservation && activeReservation.stationId === selectedStation._id && activeReservation.status !== 'active' ? (
  <Text style={{ marginTop: 10, fontStyle: 'italic', color: 'gray' }}>
    This station's reservation is not active.
  </Text>
) : selectedStation.isReserved ? (
  <Text style={{ marginTop: 10, fontStyle: 'italic', color: 'gray' }}>
    This station is already reserved.
  </Text>
) : (
  <TouchableOpacity
    style={styles.modalButton}
    onPress={() => reserveStation(selectedStation._id)}
  >
    <Text style={styles.modalButtonText}>Reserve Station</Text>
  </TouchableOpacity>
)}

                  
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
  timerBanner: {
  backgroundColor: '#4CAF50',
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
},
timerText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},

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

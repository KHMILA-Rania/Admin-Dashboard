import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform, View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import CustomBottomBar from './customBottomBar';
import GLOBALS from '../../global/variables';
import { useRef } from 'react';
import CustomAlert from './customAlert';
import NotificationBanner from './NotificationBanner ';
import useNotifications from './useNotifications';

const { height } = Dimensions.get('window');

const HomeUser = ({ navigation }) => {
  const baseUrl = `http://${GLOBALS.IP}:3000`;
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [userType, setUserType] = useState('user');
  const [userName, setUserName] = useState('User');
  const [userID, setUserID] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const mapRef = useRef(null);
  const [highlightAvailable, setHighlightAvailable] = useState(false);
  const [nearbyStations, setNearbyStations] = useState([]);
  const [showingNearby, setShowingNearby] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
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
  const [modalVisible, setModalVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  const {
    notificationCount,
    hasNewNotifications,
    markNotificationsAsSeen,
  } = useNotifications(userID, baseUrl);

  const [customAlertData, setCustomAlertData] = useState({
    allStations: [],
    filteredStations: [],
    userPlugType: ''
  });

  // Request location permissions for Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const getUserLocation = async () => {
    setLoadingLocation(true);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

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
          console.log('Location fetched:', latitude, longitude);
        },
        (error) => {
          console.log('Location error:', error);
          setLoadingLocation(false);
          let errorMessage = 'Unable to get your current location';
          switch (error.code) {
            case 1:
              errorMessage = 'Location permission denied. Please enable in settings.';
              break;
            case 2:
              errorMessage = 'Location unavailable. Check your network/GPS.';
              break;
            case 3:
              errorMessage = 'Location request timed out. Try again in an open area.';
              break;
          }
          Alert.alert(
            'Location Error',
            `${errorMessage}. Using default location instead.`,
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Try Again', onPress: getUserLocation },
              { text: 'Cancel' }
            ]
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 10000
        }
      );
    } catch (error) {
      console.log('Permission error:', error);
      setLoadingLocation(false);
      Alert.alert(
        'Permission Error',
        'Location permission is required to use this feature'
      );
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserID(storedUserId);
        console.log('User ID:', storedUserId);

        if (storedUserType) {
          setUserType(storedUserType);
        }

        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
          locationProvider: 'auto',
        });

        setTimeout(() => {
          getUserLocation();
        }, 1000);

        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          getUserLocation();
        } else {
          Alert.alert(
            'Permission Required',
            'Location permission is required to show nearby charging stations. Please enable it in your device settings.',
            [
              { text: 'Settings', onPress: () => {/* Open settings if needed */} },
              { text: 'Use Default Location', onPress: () => console.log('Using default location') }
            ]
          );
        }

        fetchStations();
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    initialize();
  }, []);

  const refreshLocation = () => {
    Alert.alert(
      'Refresh Location',
      'Do you want to refresh your current location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: getUserLocation }
      ]
    );
  };

  const handleNotificationPress = () => {
    navigation.navigate('ComplaintsList', { userID });
    markNotificationsAsSeen();
  };

  const fetchStations = async () => {
    const storedToken = await AsyncStorage.getItem('token');
    try {
      setLoadingStations(true);
      const response = await axios.get(`http://${GLOBALS.IP}:3000/station`, {
        headers: {
          Authorization: `Bearer ${storedToken}`
        }
      });
      setStations(response.data);
    } catch (error) {
      console.error('Error fetching stations:', error);
      Alert.alert('Error', 'Failed to load stations.');
    } finally {
      setLoadingStations(false);
    }
  };

  const handleNearbyStationsPress = () => {
    if (showingNearby) {
      resetToAllStations();
    } else {
      Alert.alert(
        "Search Distance",
        "Do you want to change the search distance?",
        [
          {
            text: "Use Default (10km)",
            onPress: () => findNearbyStations(10)
          },
          {
            text: "Choose Distance",
            onPress: showDistanceSelection
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    }
  };

  const showDistanceSelection = () => {
    Alert.alert(
      "Select Distance",
      "Choose your preferred search distance:",
      [
        { text: "15 km", onPress: () => findNearbyStations(15) },
        { text: "20 km", onPress: () => findNearbyStations(20) },
        { text: "25 km", onPress: () => findNearbyStations(25) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

const reserveStation = async (stationId) => {
  try {
    const storedToken = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `http://${GLOBALS.IP}:3000/reservation/${stationId}/reserve`,
      { userId: userID },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log('Reservation response:', response.data);
    Alert.alert('Reservation Successful', response.data.message);
    const reservation = response.data.reservation;
    const endTime = new Date(response.data.reservation.endTime);

    if (isNaN(endTime)) {
      console.error('Invalid reservation end time:', response.data.reservation.endTime);
      Alert.alert('Error', 'Invalid reservation time received from server');
      return;
    }

    setActiveReservation(reservation);
    setReservationEndTime(endTime);
    console.log('Reservation set:', { reservation, endTime });

    // Initialize timeLeft immediately
    const now = new Date();
    const diff = endTime - now;
    if (diff > 0) {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    } else {
      setTimeLeft('Expired');
      setActiveReservation(null);
      setReservationEndTime(null);
      await AsyncStorage.removeItem('reservationEndTime');
      await AsyncStorage.removeItem('activeReservation');
    }

    // Persist reservation data
    await AsyncStorage.setItem('reservationEndTime', endTime.toISOString());
    await AsyncStorage.setItem('activeReservation', JSON.stringify(reservation));

    fetchStations();
  } catch (error) {
    console.error('Error reserving station:', error);
    if (error.response) {
      console.error('Reservation error details:', error.response.data);
      Alert.alert('Reservation Failed', error.response.data.message || 'Failed to reserve station');
    } else {
      Alert.alert('Error', 'Could not connect to server');
    }
  }
};


  const findNearbyStations = async (maxDistance = selectedDistance) => {
    try {
      setLoadingNearby(true);
      setSelectedDistance(maxDistance);
      
      const [response, userPlugType] = await Promise.all([
        axios.get(`http://${GLOBALS.IP}:3000/station/nearby-stations`, {
          params: {
            latitude: region.latitude,
            longitude: region.longitude,
            maxDistance: maxDistance,
            limit: 10,
            requireAvailableSlots: 'true'
          }
        }),
        getUserPlugType(userID)
      ]);
      
      const allStations = response.data.data;
      const filteredStations = allStations.filter(
        station => station.plugType === userPlugType
      );

      if (response.data.success) {
        setNearbyStations(filteredStations);
        setShowingNearby(true);
        
        setCustomAlertData({
          allStations,
          filteredStations,
          userPlugType,
          searchDistance: maxDistance
        });
        setAlertVisible(true);

        if (response.data.data.length > 0) {
          setRegion({
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }
    } catch (error) {
      console.error('Error finding nearby stations:', error);
      Alert.alert('Error', 'Failed to find nearby stations');
    } finally {
      setLoadingNearby(false);
    }
  };

  const getUserPlugType = async (userId) => {
    try {
      const response = await axios.get(`http://${GLOBALS.IP}:3000/user/${userId}`);
      console.log("User plug type:", response.data.user.plugType);
      return response.data.user.plugType;
    } catch (error) {
      return null;
    }
  };

  const resetToAllStations = () => {
    setShowingNearby(false);
    setNearbyStations([]);
    getUserLocation();
  };

  const extendReservation = async (reservationId) => {
    try {
      const response = await axios.patch(
        `http://${GLOBALS.IP}:3000/reservation/${reservationId}/extend`,
        { userId: userID }
      );

      Alert.alert('Reservation Extended', response.data.message);
      setActiveReservation(response.data.reservation);
      const endTime = new Date(response.data.reservation.endTime);
      setReservationEndTime(endTime);

      // Persist updated reservation data
      await AsyncStorage.setItem('reservationEndTime', endTime.toISOString());
      await AsyncStorage.setItem('activeReservation', JSON.stringify(response.data.reservation));

      fetchStations();
    } catch (error) {
      console.error('Error extending reservation:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to extend reservation');
    }
  };

const freeStation = async (reservationId) => {
  try {
    console.log('Attempting to free station with reservationId:', reservationId, 'userId:', userID);
    const storedToken = await AsyncStorage.getItem('token');
    const response = await axios.patch(
      `http://${GLOBALS.IP}:3000/reservation/${reservationId}/cancel`,
      { userId: userID },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log('Free station response:', response.data);
    Alert.alert('Station Freed', response.data.message);

    // Reset all timer-related states
    setActiveReservation(null);
    setReservationEndTime(null);
    setTimeLeft('');
    setSelectedStation(null);
    setModalVisible(false);

    // Clear persisted data
    await AsyncStorage.removeItem('reservationEndTime');
    await AsyncStorage.removeItem('activeReservation');

    await fetchStations();
  } catch (error) {
    console.error('Error freeing station:', error);
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message,
    });

    let errorMessage = 'Failed to free station';

    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;

      if (error.response.status === 400) {
        if (errorMessage.includes('already ended') || errorMessage.includes('already canceled')) {
          console.log('Reservation already ended or canceled, clearing state');
          // Reset all timer-related states
          setActiveReservation(null);
          setReservationEndTime(null);
          setTimeLeft('');
          setSelectedStation(null);
          setModalVisible(false);
          await AsyncStorage.removeItem('reservationEndTime');
          await AsyncStorage.removeItem('activeReservation');
          await fetchStations();
        } else {
          console.error('Unhandled 400 error:', errorMessage);
          Alert.alert('Error', errorMessage);
        }
      } else {
        Alert.alert('Error', errorMessage);
      }
    } else {
      Alert.alert('Error', 'Could not connect to server');
    }
  }
};

useEffect(() => {
  let timer;

  const initializeTimer = async () => {
    try {
      const storedEndTime = await AsyncStorage.getItem('reservationEndTime');
      const storedReservation = await AsyncStorage.getItem('activeReservation');

      console.log('Stored data:', { storedEndTime, storedReservation });

      if (storedEndTime && storedReservation) {
        const endTime = new Date(storedEndTime);
        const reservation = JSON.parse(storedReservation);

        if (isNaN(endTime)) {
          console.error('Invalid stored end time:', storedEndTime);
          await AsyncStorage.removeItem('reservationEndTime');
          await AsyncStorage.removeItem('activeReservation');
          setTimeLeft('');
          return;
        }

        // Check if the reservation belongs to the current user
        if (reservation.userId !== userID) {
          console.log('Stored reservation does not belong to current user, clearing data');
          await AsyncStorage.removeItem('reservationEndTime');
          await AsyncStorage.removeItem('activeReservation');
          setTimeLeft('');
          setActiveReservation(null);
          setReservationEndTime(null);
          return;
        }

        const now = new Date();
        if (endTime > now) {
          setReservationEndTime(endTime);
          setActiveReservation(reservation);
          const diff = endTime - now;
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          const newTimeLeft = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          setTimeLeft(newTimeLeft);
          console.log('Timer restored:', { endTime, reservation, timeLeft: newTimeLeft });
        } else {
          console.log('Stored reservation expired');
          await AsyncStorage.removeItem('reservationEndTime');
          await AsyncStorage.removeItem('activeReservation');
          setTimeLeft('');
          setActiveReservation(null);
          setReservationEndTime(null);
          fetchStations();
        }
      } else {
        console.log('No stored reservation data found');
        setTimeLeft('');
      }
    } catch (error) {
      console.error('Error initializing timer:', error);
      setTimeLeft('');
    }
  };

  initializeTimer();

  // Only start timer if reservationEndTime exists AND activeReservation belongs to current user
  if (reservationEndTime && activeReservation && activeReservation.userId === userID) {
    console.log('Starting timer with endTime:', reservationEndTime.toISOString(), 'for user:', userID);
    timer = setInterval(() => {
      const now = new Date();
      const diff = reservationEndTime - now;

      if (diff <= 0) {
        console.log('Timer expired');
        clearInterval(timer);
        setTimeLeft('');
        setActiveReservation(null);
        setReservationEndTime(null);
        AsyncStorage.removeItem('reservationEndTime');
        AsyncStorage.removeItem('activeReservation');
        fetchStations();
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const newTimeLeft = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        setTimeLeft(newTimeLeft);
        console.log('Timer tick:', newTimeLeft);
      }
    }, 1000);
  } else {
    console.log('Timer not started - either no reservationEndTime or reservation does not belong to current user');
    if (reservationEndTime && activeReservation && activeReservation.userId !== userID) {
      console.log('Clearing timer data - reservation belongs to different user');
      setTimeLeft('');
      setActiveReservation(null);
      setReservationEndTime(null);
      AsyncStorage.removeItem('reservationEndTime');
      AsyncStorage.removeItem('activeReservation');
    } else {
      setTimeLeft(''); // Ensure timeLeft is cleared if no timer
    }
  }

  return () => {
    console.log('Clearing timer');
    clearInterval(timer);
  };
}, [reservationEndTime, activeReservation, userID]); // Added activeReservation and userID to dependencies


  const handleStationPress = (station) => {
    setSelectedStation(station);
    setModalVisible(true);
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
    setModalVisible(false);
  };

  const toggleHighlightAvailable = () => {
    setHighlightAvailable(!highlightAvailable);
    
    if (!highlightAvailable) {
      setRegion({
        latitude: 34.0,
        longitude: 9.0,
        latitudeDelta: 6.0,
        longitudeDelta: 6.0,
      });
    } else {
      getUserLocation();
    }
  };

  const getMarkerStyle = (station) => {
    if (highlightAvailable && !station.isReserved) {
      return {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 2,
      };
    }
    
    return {
      backgroundColor: station.isReserved ? '#FF5C5C' : 'blue',
      padding: 8,
      borderRadius: 20,
      borderColor: 'white',
      borderWidth: 2,
    };
  };

  return (
    <View style={styles.container}>
      <NotificationBanner
        notificationCount={notificationCount}
        hasNewNotifications={hasNewNotifications}
        onPress={handleNotificationPress}
        onDismiss={markNotificationsAsSeen}
      />
      <View style={styles.header}>
        {reservationEndTime && (
          <View style={styles.timerBanner}>
            <Text style={styles.timerText}>Time left: {timeLeft}</Text>
          </View>
        )}
        <Image source={require('../../assets/white.png')} style={styles.logo} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              highlightAvailable ? styles.highlightActiveButton : styles.actionButton
            ]} 
            onPress={toggleHighlightAvailable}
          >
            <Text style={styles.buttonText}>
              {highlightAvailable ? "Hide Available" : "Show Available"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton,
              showingNearby ? styles.highlightActiveButton : styles.actionButton
            ]} 
            onPress={handleNearbyStationsPress}
            disabled={loadingNearby}
          >
            <Text style={styles.buttonText}>
              {loadingNearby 
                ? "Loading..." 
                : showingNearby 
                  ? "Show All" 
                  : "Nearby Stations"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#33aab6' }]} 
            onPress={refreshLocation}
            disabled={loadingLocation}
          >
            <Text style={[styles.buttonText, { fontSize: 28 }]}>
              {loadingLocation ? "📍..." : "📍"}
            </Text>
          </TouchableOpacity>
        </View>

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={false}
          zoomEnabled={true}
          scrollEnabled={true}
        >
          <Marker
            coordinate={region}
            title="Your Location"
            description="You are here"
            pinColor="red"
          />

          {(showingNearby ? nearbyStations : stations).map((station) => (
            <Marker
              key={station._id}
              coordinate={{
                latitude: station.latitude,
                longitude: station.longitude,
              }}
              pinColor={station.isReserved ? "red" : "green"}
              onPress={() => handleStationPress(station)}
            >
              <View style={getMarkerStyle(station)}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  {showingNearby ? '📍' : '⚡'}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>

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
                <Text style={styles.modalDescription}>{`Capacity: ${selectedStation.capacity}`}</Text>
                <Text style={styles.modalDescription}>{`Available Slots: ${selectedStation.availableSlots}`}</Text>
                <Text style={styles.modalDescription}>{`Reserved ?: ${selectedStation.isReserved ? 'Yes' : 'No'}`}</Text>
                <Text style={styles.modalDescription}>{`State : ${selectedStation.state}`}</Text>
                
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigate('StationList');
                  }}
                >
                  <Text style={styles.modalButtonText}>View Stations</Text>
                </TouchableOpacity>

                {activeReservation && activeReservation.stationId === selectedStation._id && activeReservation.status === 'active' ? (
                  <>
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

        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          allStations={customAlertData.allStations}
          filteredStations={customAlertData.filteredStations}
          userPlugType={customAlertData.userPlugType}
        />

        <CustomBottomBar style={styles.customBottomBar} />
      </View>
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  timerBanner: {
    backgroundColor: '#39B2DB',
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
  container: { 
    flex: 1, 
    backgroundColor: '#223958' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 0,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: { 
    width: 170, 
    height: 70,
    marginBottom: 9
  },
  logoutButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 10
  },
  logoutText: { 
    color: '#223958', 
    fontSize: 16, 
    fontWeight: 'bold'
  },
  map: { 
    flex: 1,
    marginBottom: 20,
    marginHorizontal: 15,
    borderRadius: 60,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginVertical: 10,
    position: 'absolute',
    marginHorizontal: 15,
    bottom: 70,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'rgba(200,200,200,0.4)',
    paddingVertical: 10,
    marginBottom: 0,
  },
  actionButton: {
    backgroundColor: '#33aab6',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 0.32,
    alignItems: 'center',
  },
  highlightActiveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    flex: 0.32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
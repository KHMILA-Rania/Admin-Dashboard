import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Modal, ScrollView } from 'react-native';
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
  const requestLocationPermissionOld= async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby charging stations.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled differently
  };
  //new


// Add this function
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

//old version
  const getUserLocation= () => {
    console.log('Attempting to get user location...');
    setLoadingLocation(true);

    // First, check if location services are enabled
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location found:', position);
        const { latitude, longitude } = position.coords;
        
        // Validate coordinates
        if (latitude && longitude && 
            latitude >= -90 && latitude <= 90 && 
            longitude >= -180 && longitude <= 180) {
          
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          console.log('Location updated successfully:', { latitude, longitude });
        } else {
          console.error('Invalid coordinates received:', { latitude, longitude });
          throw new Error('Invalid coordinates');
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        console.log('Detailed location error:', error);
        setLoadingLocation(false);
        
        let errorMessage = 'Unable to get your current location. ';
        
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage += 'Location permission was denied. Please enable location services in your device settings.';
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage += 'Location information is unavailable. Please check if GPS is enabled.';
            break;
          case 3: // TIMEOUT
            errorMessage += 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += `Error code: ${error.code}. Please try again or check your location settings.`;
        }
        
        Alert.alert(
          'Location Error',
          errorMessage + ' Using default location instead.',
          [
            { 
              text: 'Retry', 
              onPress: () => getUserLocation() 
            },
            { 
              text: 'OK', 
              onPress: () => console.log('Using default location') 
            }
          ]
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout
        maximumAge: 5000, // Reduced maximum age for fresher location
        showLocationDialog: true, // Android only - prompts user to enable location
        forceRequestLocation: true, // Android only - force location request
      }
    );
  };

  //new
  const getUserLocationnn = async () => {
  setLoadingLocation(true);

  try {
    // Request permission first
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

      const servicesEnabled = await checkLocationServices();
    if (!servicesEnabled) {
      throw new Error('Location services disabled');
    }



     // 3. Get current position with retry logic
    let retries = 0;
    const maxRetries = 2;
    //new
    const attemptLocationFetch = async () => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Location successfully fetched:', latitude, longitude);
            resolve({ latitude, longitude });
          },
          (error) => {
            if (retries < maxRetries) {
              retries++;
              console.log(`Retry attempt ${retries}...`);
              setTimeout(() => attemptLocationFetch().then(resolve).catch(reject), 1000);
            } else {
              reject(error);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 5000 // Accept cached location no older than 5s
          }
        );
      });
    };

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
        
        // Log success
        console.log('Location fetched:', latitude, longitude);
      },
      (error) => {
        console.log('Location error:', error);
        setLoadingLocation(false);
        Alert.alert(
          'Location Error',
          `Unable to get your current location: ${error.message}. Using default location instead.`
        );
      },
      { 
        enableHighAccuracy: true, 
        timeout: 20000, // Increased timeout
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



const handleLocationError = (error) => {
  let errorMessage = 'Could not get your location';
  
  switch(error.code) {
    case 1: // PERMISSION_DENIED
      errorMessage = 'Location permission denied. Please enable in settings.';
      break;
    case 2: // POSITION_UNAVAILABLE
      errorMessage = 'Location unavailable. Check your network/GPS.';
      break;
    case 3: // TIMEOUT
      errorMessage = 'Location request timed out. Try again in an open area.';
      break;
  }

  Alert.alert(
    'Location Error',
    errorMessage,
    [
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings()
      },
      { 
        text: 'Try Again',
        onPress: getUserLocation
      },
      { text: 'Cancel' }
    ]
  );
};


  useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserID(storedUserId);
        console.log('User ID:', storedUserId);

        //if (storedToken) {
         // const userData = JSON.parse(storedToken);
          //setUserName(userData?.name || 'User');
       // }
        if (storedUserType) {
          setUserType(storedUserType);
        }

        // Configure Geolocation
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'whenInUse',
          locationProvider: 'auto', // Use best available provider
        //  enableBackgroundLocationUpdates: false,
        });


        setTimeout(() => {
        getUserLocation();
      }, 1000);
      
        // Request permissions and get location
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


  // Add a manual location refresh function
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
      const response = await axios.get(`http://${GLOBALS.IP}:3000/station` ,{
  headers: {
    Authorization: `Bearer ${storedToken}`
  }});
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
      const response = await axios.post(
        `http://${GLOBALS.IP}:3000/reservation/${stationId}/reserve`,
        { userId: userID }
      );

      Alert.alert('Reservation Successful', response.data.message);
      setActiveReservation(response.data.reservation);
      console.log('Active reservation state:', response.data.reservation);
      setReservationEndTime(new Date(response.data.reservation.endTime));
      fetchStations();
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
          fetchStations();
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [reservationEndTime]);

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
      console.error("Error fetching user data:", error);
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

      setActiveReservation(null);
      setReservationEndTime(null);
      setSelectedStation(null);
      setModalVisible(false);

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
          setActiveReservation(null);
          setReservationEndTime(null);
          await fetchStations();
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

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

          {/* Add location refresh button */}
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

// Keep your existing styles
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
    flex: 0.32, // Adjusted to fit 3 buttons
    alignItems: 'center',
  },
  highlightActiveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    flex: 0.32, // Adjusted to fit 3 buttons
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14, // Slightly smaller to fit 3 buttons
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
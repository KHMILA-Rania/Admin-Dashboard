import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';  // Make sure axios is imported!
import CustomBottomBar from './customBottomBar';
import GLOBALS from '../../global/variables'; // Adjust the path as necessary
import { useRef } from 'react';
import CustomAlert from './customAlert'; // Import your custom alert component
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
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
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

 const handleNotificationPress = () => {
    // Navigate to complaints screen
    navigation.navigate('ComplaintsList', { userID });
    // Mark notifications as seen
    markNotificationsAsSeen();
  };

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


const handleNearbyStationsPress = () => {
  if (showingNearby) {
    resetToAllStations();
  } else {
    // Show distance selection alert
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
      { text: "20 km", onPress: () => findNearbyStations(20) },
            { text: "25 km", onPress: () => findNearbyStations(25) },
      { text: "15 km", onPress: () => findNearbyStations(15) },
      { text: "15 km", onPress: () => findNearbyStations(15) },
      { text: "20 km", onPress: () => findNearbyStations(20) },

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
      
      // Set data for custom alert
      setCustomAlertData({
        allStations,
        filteredStations,
        userPlugType,
        searchDistance: maxDistance
      });
      setAlertVisible(true);

      // Remove the old Alert.alert call - it's replaced by the custom alert

      // Optionally zoom to show nearby stations area
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
  getUserLocation(); // Return to user location
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
    setModalVisible(false); // Close the modal
  };

  const toggleHighlightAvailable = () => {
    setHighlightAvailable(!highlightAvailable);
    
    // If turning on highlight, zoom out to show all of Tunisia
    if (!highlightAvailable) {
      // Set region to cover all of Tunisia
      setRegion({
        latitude: 34.0, // Approximate center latitude of Tunisia
        longitude: 9.0, // Approximate center longitude of Tunisia
        latitudeDelta: 6.0, // Wider zoom to show the whole country
        longitudeDelta: 6.0,
      });
    } else {
      // If turning off highlight, return to user location
      getUserLocation();
    }
  };

  const getMarkerStyle = (station) => {
    // If highlight is on AND station is available
    if (highlightAvailable && !station.isReserved) {
      return {
        backgroundColor: '#4CAF50', // Bright green for available stations when highlighted
        padding: 8,
        borderRadius: 20,
        borderColor: 'white',
        borderWidth: 2,
      };
    }
    
    // Default style based on reservation status
    return {
      backgroundColor: station.isReserved ? '#FF5C5C' : 'blue', // Red for reserved, blue for available
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
        onDismiss={markNotificationsAsSeen} // Optional: allow dismissing without viewing
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
          
        </View>


        <MapView
          ref={mapRef}
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

                <Text style={styles.modalDescription}>{`Capacity: ${selectedStation.capacity}`}</Text>
                <Text style={styles.modalDescription}>{`Available Slots: ${selectedStation.availableSlots}`}</Text>
                <Text style={styles.modalDescription}>{`Reserved ?: ${selectedStation.isReserved ? 'Yes' : 'No'}`}</Text>
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

    paddingBottom:0,
    marginBottom:0,
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
    height: 70 ,
    marginBottom:9
  },
  logoutButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
     marginBottom:10
  },
  logoutText: { 
    color: '#223958', 
    fontSize: 16, 
    fontWeight: 'bold' 
    ,
   
  },
  titles: { 
    alignItems: 'center', 
    marginTop: 0 
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#223958' 
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
    marginBottom:0,
  },
  actionButton: {
    backgroundColor: '#33aab6',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 0.49,
    alignItems: 'center',
  },
  highlightActiveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calloutView: { 
    width: 150 
  },
  calloutTitle: { 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  calloutDescription: { 
    fontSize: 12 
  },

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
   alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  alertHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 24,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  alertScrollView: {
    maxHeight: 300,
  },
  alertContent: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D9CDB',
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 15,
  },
  distanceContainer: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  distanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 18,
  },
  plugTypeContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  plugTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 5,
  },
  plugTypeSubtext: {
    fontSize: 13,
    color: '#059669',
  },
  stationsListContainer: {
    marginTop: 5,
  },
  stationsListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 10,
  },
  stationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  stationDistance: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  availabilityBadge: {
    backgroundColor: '#E6FFFA',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availabilityText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '500',
  },
  alertActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  alertButton: {
    backgroundColor: '#2D9CDB',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#2D9CDB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeUser;
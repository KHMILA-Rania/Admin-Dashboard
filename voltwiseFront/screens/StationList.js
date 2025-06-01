import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Alert } from 'react-native';

import GLOBALS from '../global/variables';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CustomBottomBar from './user/customBottomBar';

import AsyncStorage from '@react-native-async-storage/async-storage';

const StationList = () => {
  const navigation = useNavigation();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationDetails, setStationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [deletingStation, setDeletingStation] = useState(false);
   const [activeReservation, setActiveReservation] = useState(null);
    const [reservationEndTime, setReservationEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [userID, setUserID] = useState('');

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

       
     
      } catch (error) {
        console.error('Error loading user data:', error);
      }
 };
    initialize();
  }, []);


 const fetchStations = async () => {
  try {
    const response = await axios.get(`http://${GLOBALS.IP}:3000/station`);
    setStations(response.data);
    console.log('Fetched stations:', response.data);
  } catch (error) {
    Alert.alert('Error', 'Failed to load stations');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const reserveStation = async (stationId) => {
  try {
    const response = await axios.patch(
      `http://${GLOBALS.IP}:3000/station/reserve/${stationId}`,
      { userId: userID }
    );
    console.log('userid :', userID);

    Alert.alert('Reservation Successful', response.data.message);

    setActiveReservation(response.data.station);
    setReservationEndTime(new Date(response.data.station.reservationExpiresAt));

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

  const fetchStationDetails = async (stationId) => {
    setLoadingDetails(true);
    setDetailsError(null);
    try {
      const res = await axios.get(`http://${GLOBALS.IP}:3000/station/${stationId}/station`);
      // Extract the station data from the response
      setStationDetails(res.data.station);
    } catch (err) {
      console.error('Failed to fetch station details:', err.message);
      setDetailsError('Failed to load station details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateStation = (station) => {
    closeModal();
    // Navigate to update/edit screen with station data
    navigation.navigate('UpdateStation', { station });
  };

  const handleDeleteStation = async (stationId) => {
    setDeletingStation(true);
    try {
      await axios.delete(`http://${GLOBALS.IP}:3000/station/${stationId}`);
      
      // Remove the station from the local state
      setStations(prevStations => 
        prevStations.filter(station => 
          (station._id || station.id) !== stationId
        )
      );
      
      closeModal();
      
      // Optional: Show success message
      console.log('Station deleted successfully');
      
    } catch (err) {
      console.error('Failed to delete station:', err.message);
      setDetailsError('Failed to delete station. Please try again.');
    } finally {
      setDeletingStation(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStations();
  }, []);

  const handleViewDetails = async (station) => {
    setSelectedStation(station);
    setModalVisible(true);
    await fetchStationDetails(station._id || station.id);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStation(null);
    setStationDetails(null);
    setDetailsError(null);
    setDeletingStation(false);
  };

  const renderStationCard = ({ item }) => {
    const [lon, lat] = item.location.coordinates; // Note: GeoJSON format is [longitude, latitude]
    
    return (
       <View style={styles.container}>
     

      <View style={styles.card}>
        
        <View style={styles.cardHeader}>
          <Text style={styles.stationName}>{item.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {item.state === 'active' ? '🟢 Active' : '🔴 Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={styles.stationDetails}>
          <Text style={styles.stationInfo}>
            📌 Location: {lat.toFixed(4)}, {lon.toFixed(4)}
          </Text>
          <Text style={styles.stationInfo}>
            🔋 Capacity: {item.capacity} slots
          </Text>
          <Text style={styles.stationInfo}>
            🔌 Plug Type: {item.plugType}
          </Text>
          <Text style={styles.stationInfo}>
            ⚡ Power: {item.kilowatt}kW
          </Text>
          <Text style={styles.stationInfo}>
            💰 Price: ${item.pricePerKWh}/kWh
          </Text>
          <Text style={styles.stationInfo}>
            🚗 Available Slots: {item.availableSlots}/{item.capacity}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.supportedVehicles}>
            Supports: {Array.isArray(item.supportedVehicles) 
              ? item.supportedVehicles.join(', ') 
              : item.supportedVehicles}
          </Text>
          
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => reserveStation(item._id)}
          >
            <Text style={styles.detailsButtonText}>Reserve </Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    );
  };

  const renderStationDetailsModal = () => {
    // Prioritize fresh API data over cached list data
    const station = stationDetails || selectedStation;
    if (!station) return null;

    const [lon, lat] = station.location?.coordinates || [0, 0];
    
    console.log('Modal station data:', {
      name: station.name,
      state: station.state,
      source: stationDetails ? 'API' : 'cached'
    });

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{station.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeModal}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.modalLoadingText}>Loading details...</Text>
              </View>
            ) : detailsError ? (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{detailsError}</Text>
                <TouchableOpacity
                  style={styles.modalRetryButton}
                  onPress={() => fetchStationDetails(selectedStation._id || selectedStation.id)}
                >
                  <Text style={styles.modalRetryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Station Status</Text>
                    <View style={styles.modalStatusBadge}>
                      <Text style={styles.modalStatusText}>
                        {station.state === 'active' ? '🟢 Active' : '🔴 Inactive'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Location</Text>
                    <Text style={styles.modalDetailText}>
                      📌 Coordinates: {lat.toFixed(6)}, {lon.toFixed(6)}
                    </Text>
                    {station.owner?.adress && (
                      <Text style={styles.modalDetailText}>
                        🏠 Address: {station.owner.adress}
                      </Text>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Technical Specifications</Text>
                    <Text style={styles.modalDetailText}>
                      🔋 Total Capacity: {station.capacity} charging slots
                    </Text>
                    <Text style={styles.modalDetailText}>
                      🚗 Available Slots: {station.availableSlots || 0}/{station.capacity}
                    </Text>
                    <Text style={styles.modalDetailText}>
                      🔌 Plug Type: {station.plugType}
                    </Text>
                    <Text style={styles.modalDetailText}>
                      ⚡ Power Output: {station.kilowatt}kW
                    </Text>
                    <Text style={styles.modalDetailText}>
                      ⏱️ Charging Time: {station.chargingTime} minutes
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Pricing</Text>
                    <Text style={styles.modalDetailText}>
                      💰 Rate: ${station.pricePerKWh}/kWh
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Vehicle Compatibility</Text>
                    <Text style={styles.modalDetailText}>
                      🚙 Supported Vehicles: {Array.isArray(station.supportedVehicles) 
                        ? station.supportedVehicles.join(', ') 
                        : station.supportedVehicles}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Reservation Status</Text>
                    <Text style={styles.modalDetailText}>
                      {station.isReserved ? '🔒 Reserved' : '🔓 Available for reservation'}
                    </Text>
                  </View>

                  {station.owner && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Owner Information</Text>
                      <Text style={styles.modalDetailText}>
                        👤 Name: {station.owner.name}
                      </Text>
                      <Text style={styles.modalDetailText}>
                        📧 Email: {station.owner.email}
                      </Text>
                      <Text style={styles.modalDetailText}>
                        📞 Phone: {station.owner.phone}
                      </Text>
                    </View>
                  )}

                  {station.image && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Station Image</Text>
                      <Text style={styles.modalDetailText}>
                        🖼️ Image URL: {station.image}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Created</Text>
                    <Text style={styles.modalDetailText}>
                      📅 {new Date(station.createdAt).toLocaleDateString()} at {new Date(station.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                </ScrollView>

                {/* Fixed Action Buttons at Bottom */}
                <View style={styles.modalActionButtons}>
               
                  
                 
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.content}>
            <TouchableOpacity
        style={styles.reservationButton}
        onPress={async () => {
          try {
            console.log('Navigating to UserReservations',userID);
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
              navigation.navigate('UserReservations', { userId });
            } else {
              Alert.alert('Error', 'User ID not found');
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to retrieve user ID');
          }
        }}
      >
        <Text style={styles.reservationButtonText}>Go to My Reservations</Text>
      </TouchableOpacity>

        <Text style={styles.heading}>Available Stations ({stations.length})</Text>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.loadingText}>Loading stations...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchStations}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : stations.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.noStationsText}>No stations found.</Text>
            
          </View>
        ) : (
          <FlatList
            data={stations}
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderStationCard}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <CustomBottomBar />
      {renderStationDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  stationDetails: {
    marginBottom: 12,
  },
  stationInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  supportedVehicles: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  detailsButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noStationsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 8,
  },
  noStationsSubText: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
modalContainer: {
  backgroundColor: '#fff',
  borderRadius: 16,
  width: '90%',
  height: '85%',       // <-- Increase height here
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 10,
  elevation: 10,
},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reservationButton: {
    backgroundColor: '#223958',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
    button: {
    backgroundColor: '#649ea2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  modalStatusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  modalErrorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalRetryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalRetryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Action buttons styles
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
    backgroundColor: '#fff',
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StationList;
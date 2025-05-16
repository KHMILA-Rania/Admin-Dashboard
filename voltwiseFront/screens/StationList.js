import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, ScrollView, Alert
} from 'react-native';
import axios from 'axios';
import GLOBALS from '../global/variables';
import CustomBottomBar from './user/customBottomBar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StationList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get(`http://${GLOBALS.IP}:3000/station`);
        setStations(response.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load stations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleViewDetails = (station) => {
    setSelectedStation(station);
    setModalVisible(true);
  };

  // Updated reservation function to use /station/:stationId/reserve
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


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.state}>State: {item.state}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleViewDetails(item)}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#28a745', marginTop: 8 }]}
          onPress={() => reserveStation(item._id)}
        >
          <Text style={styles.buttonText}>Reserve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.listTitle}>Available Charging Stations</Text>

      <TouchableOpacity
        style={styles.reservationButton}
        onPress={async () => {
          try {
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

      <FlatList
        data={stations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            {selectedStation && (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Image source={{ uri: selectedStation.image }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedStation.name}</Text>
                <View style={styles.detailContainer}>
                  <Text style={styles.detailText}>📍 Location: {selectedStation.location}</Text>
                  <Text style={styles.detailText}>🔌 Plug Type: {selectedStation.plugType}</Text>
                  <Text style={styles.detailText}>⚡ Capacity: {selectedStation.capacity}</Text>
                  <Text style={styles.detailText}>🛠️ State: {selectedStation.state}</Text>
                  <Text style={styles.detailText}>⏱️ Charging Time: {selectedStation.chargingTime}</Text>
                  <Text style={styles.detailText}>🔋 Kilowatt: {selectedStation.kilowatt} kW</Text>
                  <Text style={styles.detailText}>🏷️ Marque: {selectedStation.marque}</Text>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <CustomBottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f8f8f8',
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  state: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#649ea2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  reservationButton: {
    backgroundColor: '#007AFF',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailContainer: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'left',
    color: '#555',
  },
  closeBtn: {
    backgroundColor: '#649ea2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StationList;

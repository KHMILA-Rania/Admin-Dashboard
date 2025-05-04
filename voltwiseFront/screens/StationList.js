import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Button, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import GLOBALS from '../global/variables';
import CustomBottomBar from './user/customBottomBar';

const StationList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);

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
        <View style={{ flex: 1 }}>
          <Text style={styles.listTitle}> Available Charging Stations</Text>
          <FlatList
            data={stations}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
      
          {/* Modal for Details */}
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
      
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeButtonText}>❌ Close</Text>
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
          <CustomBottomBar></CustomBottomBar>
        </View>
      );
      
  
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
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
    padding: 10,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContainer: {
    width: '85%', // Adjust modal width
    maxHeight: '80%', // Limit the height
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
  },
  modalDetailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalValue: {
    fontSize: 16,
    color: '#555',
    marginLeft: 8,
  },
  closeBtn:{
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
  detailContainer: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'left',
  },
  
});

export default StationList;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import GLOBALS from '../../global/variables';
import BottomNavbar from './BottomNavBar'; 

const Stations = () => {
  const navigation = useNavigation();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStations = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.warn('No userId found in storage');
        return;
      }

      const res = await axios.get(`http://${GLOBALS.IP}:3000/station/owner/${userId}`);
      setStations(res.data);
    } catch (err) {
      console.error('Failed to fetch stations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const renderStationCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.stationName}>{item.name}</Text>
      <Text style={styles.stationInfo}>📌 {item.location}</Text>
      <Text style={styles.stationInfo}>🔋 Capacity: {item.capacity}</Text>
      <Text style={styles.stationInfo}>🪫 Plug: {item.plugType}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateStation')}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Add Station</Text>
        </TouchableOpacity>

             <Text style={styles.heading}>My Stations</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : stations.length === 0 ? (
          <Text style={styles.noStationsText}>No stations found.</Text>
        ) : (
          <FlatList
            data={stations}
            keyExtractor={(item) => item._id}
            renderItem={renderStationCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <BottomNavbar /> 
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
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: '#222',
  },
  stationInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  noStationsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Stations;

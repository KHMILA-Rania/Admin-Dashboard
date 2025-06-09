import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import GLOBALS from '../../global/variables';
import { useRoute } from '@react-navigation/native';
import CancelBtn from './CancelBtn';  // Import your CancelBtn component
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const navigation= useNavigation();
  const userId = route?.params?.userId;

  // Fetch reservations for the user
  const fetchReservations = async () => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`http://${GLOBALS.IP}:3000/reservation/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch reservations');
      const data = await response.json();
      const reservationsData = Array.isArray(data) ? data : data.reservations || [];
      reservationsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setReservations(reservationsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [userId]);

  // Called after successful cancel to refresh list
  const onCancelSuccess = () => {
    fetchReservations();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (reservations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No reservations found.</Text>
      </View>
    );
  }

  const formatDateTime = (dt) => new Date(dt).toLocaleString();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      
     <View style={styles.header}>
 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Text style={styles.backIcon}>{'<'}</Text>
</TouchableOpacity>
  <Text style={styles.title}>My Reservations</Text>
</View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => item._id ?? Math.random().toString()}
        renderItem={({ item }) => {
          const statusColor =
            item.status === 'active' ? 'green' :
            item.status === 'cancelled' ? 'red' :
            'black';

          return (
            <View style={styles.card}>
              <Text style={styles.stationName}>Station: {item.stationId?.name ?? 'Unknown'}</Text>
              <Text style={{ color: statusColor, fontWeight: 'bold' }}>
                Status: {item.status}
              </Text>
              <Text style={styles.dateText}>From: {formatDateTime(item.startTime)}</Text>
              <Text style={styles.dateText}>To: {formatDateTime(item.endTime)}</Text>

              {item.status === 'active' && (
                <CancelBtn
                  reservationId={item._id}
                  userId={userId}           
                  onCancelSuccess={onCancelSuccess}
                />
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 16,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#28a745',
    paddingBottom: 6,
    alignSelf: 'center',
    letterSpacing: 1,
    width: '80%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  dateText: {
    color: '#555',
    marginBottom: 2,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
},
backButton: {
  marginRight: 12,
},
backIcon: {
  fontSize: 28,
  color: '#2c3e50',
  fontWeight: 'bold',
},
title: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#2c3e50',
},

});


export default UserReservations;

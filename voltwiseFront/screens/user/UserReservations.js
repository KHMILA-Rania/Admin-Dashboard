import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import GLOBALS from '../../global/variables';
import { useRoute } from '@react-navigation/native';
import CancelBtn from './CancelBtn';  // Import your CancelBtn component

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
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
      <Text style={{ textAlign: 'center', marginTop: 10 }}>Reservation List</Text>
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
              <Text>From: {formatDateTime(item.startTime)}</Text>
              <Text>To: {formatDateTime(item.endTime)}</Text>

              {item.status === 'active' && (
                <CancelBtn
                  reservationId={item._id}
                  userId={userId}              // Pass userId here
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    padding: 16,
    margin: 10,
    backgroundColor: '#f0f4f7',
    borderRadius: 8,
  },
  stationName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserReservations;

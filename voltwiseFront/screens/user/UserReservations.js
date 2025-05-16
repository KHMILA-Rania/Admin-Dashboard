import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import GLOBALS from '../../global/variables';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UserReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const userId = route?.params?.userId;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${GLOBALS.IP}:3000/reservation/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch reservations');
        const data = await response.json();
        console.log('Raw fetch response length:', data.length || (data.reservations ? data.reservations.length : 0));
        console.log('First reservation item:', data[0] || (data.reservations ? data.reservations[0] : null));

        setReservations(Array.isArray(data) ? data : data.reservations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchReservations();
    } else {
      setLoading(false);
    }
  }, [userId]);

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
        keyExtractor={(item) => item._id}
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

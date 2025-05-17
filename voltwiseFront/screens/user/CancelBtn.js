import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import GLOBALS from '../../global/variables';  // Adjust path accordingly

const CancelBtn = ({ reservationId,userId, onCancelSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleCancelReservation = async () => {
    try {
      setLoading(true);
      console.log(`Attempting to cancel reservation: ${reservationId} for user: ${userId}`);
      const response = await axios.patch(`http://${GLOBALS.IP}:3000/reservation/${reservationId}/cancel`,
        { userId }  
      );
      console.log('Reservation cancelled:', response.data);
      Alert.alert('Success', 'Reservation cancelled successfully');
      if (onCancelSuccess) {
        onCancelSuccess();
      }
       
     
    } catch (error) {
      console.error('Cancel reservation error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleCancelReservation}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Cancel Reservation</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CancelBtn;

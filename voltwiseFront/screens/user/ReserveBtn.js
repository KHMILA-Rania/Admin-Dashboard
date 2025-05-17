
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,ActivityIndicator, Image, Dimensions, Alert, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../global/variables';

const ReserveBtn=({stationId,fetchStations })=>{
   const [loading, setLoading] = useState(false);
    const [userID, setUserID] = useState('');
   
    useEffect(() => {
        const fetchUserId = async () => {
         try {
              const id = await AsyncStorage.getItem('userId'); // make sure you stored it as 'user_id'
             if (id) {
             setUserID(id);
             console.log('User ID retrieved:', id);
             } else {
              console.warn('User ID not found in storage');
             }
            } catch (error) {
                console.error('Error retrieving user ID:', error);
            }
     };
    
            fetchUserId();
            
        }
        ,[]);




      const reserveStation = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      const response = await axios.post(
        `http://${GLOBALS.IP}:3000/reservation/${stationId}/reserve`,
        { userId }
      );

      Alert.alert('Reservation Successful', response.data.message);

     

    } catch (error) {
      console.error('Error reserving station:', error);
      if (error.response) {
        Alert.alert('Reservation Failed', error.response.data.message || 'Failed to reserve station');
      } else {
        Alert.alert('Error', 'Could not connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

      return(
          <TouchableOpacity
      style={{
        backgroundColor: '#28a745',
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'flex-start'
      }}
      onPress={reserveStation}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={{ color: '#fff', fontWeight: '600' }}>Reserve</Text>
      )}
    </TouchableOpacity>
      )

}
export default ReserveBtn;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
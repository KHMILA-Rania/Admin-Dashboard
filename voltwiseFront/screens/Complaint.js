import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet , TouchableOpacity} from 'react-native';
import AuthService from '../services/authService'; // Import your AuthService
import GLOBALS from '../global/variables';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import style from './style';


const Complaint = () => {
  const navigation=useNavigation();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null); // To store the user ID
  
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          setError('User ID not found');
          setIsLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch user ID');
        setIsLoading(false);
      }
    };

    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (!subject || !description) {
      Alert.alert('Error', 'Please fill in both subject and description.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID is not available.');
      return; // Don't proceed if the userId is not available
    }

    try {
      console.log('before submiting complaint', { userId, subject, description });
      const response = await fetch(`http://${GLOBALS.IP}:3000/complaint/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subject,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Complaint submitted successfully!');
        setSubject('');
        setDescription('');
      } else {
        Alert.alert('Error', data.message || 'Failed to submit complaint');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit a Complaint</Text>
      
      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Enter the subject"
      />
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter the description"
        multiline
        numberOfLines={7}
      />
      
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
  <Text style={styles.submitButtonText}>Submit Complaint</Text>
</TouchableOpacity>


<TouchableOpacity style={styles.complaintsbtn} onPress={() => navigation.navigate('ComplaintsList')}>
  <Text style={styles.complaintsLinkText}>Go to Complaints List</Text>
</TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f4f7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
    fontWeight: '600',
  },
  input: {
    minHeight: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#14939C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  complaintsLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  complaintsLinkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  complaintsbtn:{
    backgroundColor: '#568c89',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  descriptionInput: {
    height: 120, 
    textAlignVertical: 'top', 
  },
});



export default Complaint;

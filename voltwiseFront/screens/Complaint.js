import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AuthService from '../services/authService'; // Import your AuthService
import GLOBALS from '../global/variables';

const Complaint = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null); // To store the user ID
  
  // Fetch user ID only on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { success, user } = await AuthService.getUserById(); // Make sure this call works
      if (success && user) {
        setUserId(user._id); // Assuming user._id is the correct user ID field
      } else {
        Alert.alert('Error', 'Unable to fetch user details.');
      }
    };
    fetchUser();
  }, []); // Empty dependency array ensures this runs only once after mount

  // Handle the form submission
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
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter the description"
        multiline
        numberOfLines={4}
      />
      
      <Button title="Submit Complaint" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
});

export default Complaint;

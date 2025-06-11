import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import GLOBALS from '../global/variables'; // Adjust the import path as necessar
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const navigation= useNavigation();
  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`http://${GLOBALS.IP}:3000/contact/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        // Optionally, log or use data.contact
        console.log('Contact Saved:', data.contact);

        // Clear form
        setName('');
        setEmail('');
        setMessage('');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Network Error', 'Failed to send your message. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>

  <Text style={styles.backText}>← Back</Text>
</TouchableOpacity>
      <Text style={styles.title}>Contact Us</Text>


        <Text style={styles.description}>
    Welcome! We'd love to hear from you. Kindly fill out the form below or feel free to call us directly.
  </Text>
      <TextInput
        style={styles.formContainer}
        placeholder="Your Name"
         placeholderTextColor={'black'}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.formContainer}
        placeholder="Your Email"
        placeholderTextColor={'black'}
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        style={[styles.formContainer, styles.messageInput]}
        placeholder="Your Message"
              placeholderTextColor={'black'}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 15,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
  alignSelf: 'center',
  marginBottom: 10,
   marginTop:0
},
backText: {
  color: '#4a90e2',
  fontSize: 16,
  fontWeight: '500',
 
},
});

export default ContactUs;

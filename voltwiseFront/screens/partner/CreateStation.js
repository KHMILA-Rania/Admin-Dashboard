import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import GLOBALS from '../../global/variables';
import BottomNavBar from './BottomNavBar';

const CreateStation = () => {
  const [formData, setFormData] = useState({
    name: '',
    marque: '',
    plugType: '',
    capacity: '',
    location: '',
    chargingTime: '',
    kilowatt: '',
    availableSlots: '',
    pricePerKWh: '',
    supportedVehicles: '',
    latitude: '',
    longitude: '',
    state: 'active',
    image: null,
  });

  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    const fetchOwnerId = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId'); // your key name here
        if (userId) {
          setOwnerId(userId);
        } else {
          Alert.alert('Error', 'User not logged in');
        }
      } catch (error) {
        console.error('Failed to load user ID from AsyncStorage', error);
        Alert.alert('Error', 'Failed to get user info');
      }
    };

    fetchOwnerId();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode && response.assets?.length > 0) {
        setFormData({ ...formData, image: response.assets[0] });
      }
    });
  };

  const handleSubmit = async () => {
    if (!ownerId) {
      Alert.alert('Error', 'Cannot create station without a logged-in user');
      return;
    }

    if (!formData.name || !formData.availableSlots || !formData.pricePerKWh || !formData.supportedVehicles) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'supportedVehicles') {
        data.append(key, value);
      } else if (key === 'image' && value) {
        data.append('image', {
          uri: value.uri,
          name: value.fileName || 'photo.jpg',
          type: value.type || 'image/jpeg',
        });
      } else {
        data.append(key, value);
      }
    });

    data.append('owner', ownerId);

    try {
      const response = await axios.post(`http://${GLOBALS.IP}:3000/station/add`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Alert.alert('Success', 'Station created successfully');
      console.log(response.data);
    } catch (error) {
      console.error('Error adding station:', error);
      Alert.alert('Error', 'Failed to create station');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create New Station</Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('name', value)}
            value={formData.name}
          />
          {/* ... rest of inputs remain unchanged ... */}
          <TextInput
            placeholder="Marque"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('marque', value)}
            value={formData.marque}
          />
          <TextInput
            placeholder="Plug Type"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('plugType', value)}
            value={formData.plugType}
          />
          <TextInput
            placeholder="Capacity"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('capacity', value)}
            value={formData.capacity}
          />
          <TextInput
            placeholder="Location"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('location', value)}
            value={formData.location}
          />
          <TextInput
            placeholder="Charging Time"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('chargingTime', value)}
            value={formData.chargingTime}
          />
          <TextInput
            placeholder="Kilowatt"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('kilowatt', value)}
            value={formData.kilowatt}
          />
          <TextInput
            placeholder="Available Slots"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('availableSlots', value)}
            value={formData.availableSlots}
          />
          <TextInput
            placeholder="Price per KWh"
            keyboardType="numeric"
            placeholderTextColor={'#888'}
            style={styles.input}
            onChangeText={(value) => handleInputChange('pricePerKWh', value)}
            value={formData.pricePerKWh}
          />
          <TextInput
            placeholder="Supported Vehicles (comma separated)"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('supportedVehicles', value)}
            value={formData.supportedVehicles}
          />
          <TextInput
            placeholder="Latitude"
            keyboardType="numeric"
            placeholderTextColor={'#888'}
            style={styles.input}
            onChangeText={(value) => handleInputChange('latitude', value)}
            value={formData.latitude}
          />
          <TextInput
            placeholder="Longitude"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('longitude', value)}
            value={formData.longitude}
          />

          <Button title="Choose Image" onPress={pickImage} />
          {formData.image && <Image source={{ uri: formData.image.uri }} style={styles.image} />}

          <View style={styles.submitBtn}>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={{color:'white'}}>submit</Text>
            </TouchableOpacity>
          </View>
         
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  submitBtn:{
    backgroundColor: '#2e86c1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
    paddingTop:10,
    marginTop: 10,
   
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    color: '#333',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    resizeMode: 'contain',
  },

});

export default CreateStation;

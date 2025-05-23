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
    plugType: '',
    capacity: '',
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
        const userId = await AsyncStorage.getItem('userId');
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

    // Validate required fields based on API response structure
    if (!formData.name || !formData.plugType || !formData.capacity || 
        !formData.availableSlots || !formData.pricePerKWh || !formData.supportedVehicles ||
        !formData.latitude || !formData.longitude || !formData.chargingTime || !formData.kilowatt) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const data = new FormData();

    // Add basic fields
    data.append('name', formData.name);
    data.append('plugType', formData.plugType);
    data.append('capacity', parseInt(formData.capacity));
    data.append('chargingTime', formData.chargingTime);
    data.append('kilowatt', parseInt(formData.kilowatt));
    data.append('availableSlots', parseInt(formData.availableSlots));
    data.append('pricePerKWh', parseFloat(formData.pricePerKWh));
    data.append('state', formData.state);
    data.append('owner', ownerId);

    // Handle coordinates - convert to numbers
    const longitude = parseFloat(formData.longitude);
    const latitude = parseFloat(formData.latitude);
    
    data.append('longitude', longitude);
    data.append('latitude', latitude);

    // Handle location object structure
    data.append('location[type]', 'Point');
    data.append('location[coordinates][0]', longitude);
    data.append('location[coordinates][1]', latitude);

    // Handle supported vehicles array (split comma-separated string)
    const vehiclesArray = formData.supportedVehicles.split(',').map(v => v.trim()).filter(v => v);
    vehiclesArray.forEach((vehicle, index) => {
      data.append(`supportedVehicles[${index}]`, vehicle);
    });

    // Handle image
    if (formData.image) {
      data.append('image', {
        uri: formData.image.uri,
        name: formData.image.fileName || 'photo.jpg',
        type: formData.image.type || 'image/jpeg',
      });
    }

    try {
      const response = await axios.post(`http://${GLOBALS.IP}:3000/station/add`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      Alert.alert('Success', 'Station created successfully');
      console.log('Station created:', response.data);
      
      // Reset form after successful creation
      setFormData({
        name: '',
        plugType: '',
        capacity: '',
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
      
    } catch (error) {
      console.error('Error adding station:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        Alert.alert('Error', `Failed to create station: ${error.response.data.message || 'Unknown error'}`);
      } else {
        Alert.alert('Error', 'Failed to create station');
      }
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
            placeholder="Name *"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('name', value)}
            value={formData.name}
          />

          <TextInput
            placeholder="Plug Type *"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('plugType', value)}
            value={formData.plugType}
          />

          <TextInput
            placeholder="Capacity *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('capacity', value)}
            value={formData.capacity}
          />

          <TextInput
            placeholder="Charging Time *"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('chargingTime', value)}
            value={formData.chargingTime}
          />

          <TextInput
            placeholder="Kilowatt *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('kilowatt', value)}
            value={formData.kilowatt}
          />

          <TextInput
            placeholder="Available Slots *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('availableSlots', value)}
            value={formData.availableSlots}
          />

          <TextInput
            placeholder="Price per KWh *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('pricePerKWh', value)}
            value={formData.pricePerKWh}
          />

          <TextInput
            placeholder="Supported Vehicles * (comma separated)"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('supportedVehicles', value)}
            value={formData.supportedVehicles}
          />

          <TextInput
            placeholder="Latitude *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('latitude', value)}
            value={formData.latitude}
          />

          <TextInput
            placeholder="Longitude *"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor={'#888'}
            onChangeText={(value) => handleInputChange('longitude', value)}
            value={formData.longitude}
          />

          <Button title="Choose Image" onPress={pickImage} />
          {formData.image && (
            <Image source={{ uri: formData.image.uri }} style={styles.image} />
          )}

          <View style={styles.submitBtn}>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 16 }}>
                Create Station
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    backgroundColor: '#2e86c1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'center',
    marginTop: 20,
    minWidth: 150,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 15,
    borderRadius: 10,
    resizeMode: 'contain',
  },
});

export default CreateStation;
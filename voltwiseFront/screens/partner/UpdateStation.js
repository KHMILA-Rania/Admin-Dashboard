import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import GLOBALS from '../../global/variables';

const UpdateStation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { station } = route.params;

  const [formData, setFormData] = useState({
    name: '',
    plugType: '',
    capacity: '',
    longitude: '',
    latitude: '',
    state: 'active',
    chargingTime: '',
    kilowatt: '',
    pricePerKWh: '',
    supportedVehicles: '',
    image: '',
    availableSlots: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (station) {
      setFormData({
        name: station.name || '',
        plugType: station.plugType || '',
        capacity: station.capacity?.toString() || '',
        longitude: station.longitude?.toString() || station.location?.coordinates?.[0]?.toString() || '',
        latitude: station.latitude?.toString() || station.location?.coordinates?.[1]?.toString() || '',
        state: station.state || 'active',
        chargingTime: station.chargingTime?.toString() || '',
        kilowatt: station.kilowatt?.toString() || '',
        pricePerKWh: station.pricePerKWh?.toString() || '',
        supportedVehicles: Array.isArray(station.supportedVehicles) 
          ? station.supportedVehicles.join(', ') 
          : station.supportedVehicles || '',
        image: station.image || '',
        availableSlots: station.availableSlots?.toString() || '',
      });
    }
  }, [station]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Station name is required';
    if (!formData.plugType.trim()) newErrors.plugType = 'Plug type is required';
    if (!formData.capacity || isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = 'Valid capacity is required';
    }
    if (!formData.longitude || isNaN(formData.longitude)) {
      newErrors.longitude = 'Valid longitude is required';
    }
    if (!formData.latitude || isNaN(formData.latitude)) {
      newErrors.latitude = 'Valid latitude is required';
    }
    if (!formData.kilowatt || isNaN(formData.kilowatt) || parseFloat(formData.kilowatt) <= 0) {
      newErrors.kilowatt = 'Valid kilowatt is required';
    }
    if (!formData.pricePerKWh || isNaN(formData.pricePerKWh) || parseFloat(formData.pricePerKWh) <= 0) {
      newErrors.pricePerKWh = 'Valid price per kWh is required';
    }
    if (!formData.chargingTime || isNaN(formData.chargingTime) || parseInt(formData.chargingTime) <= 0) {
      newErrors.chargingTime = 'Valid charging time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateStation = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        plugType: formData.plugType.trim(),
        capacity: parseInt(formData.capacity),
        longitude: parseFloat(formData.longitude),
        latitude: parseFloat(formData.latitude),
        state: formData.state,
        chargingTime: formData.chargingTime,
        kilowatt: parseFloat(formData.kilowatt),
        pricePerKWh: parseFloat(formData.pricePerKWh),
        supportedVehicles: formData.supportedVehicles
          .split(',')
          .map(vehicle => vehicle.trim())
          .filter(vehicle => vehicle.length > 0),
        image: formData.image.trim() || station.image,
        availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : station.availableSlots,
      };

      const response = await axios.put(
        `http://${GLOBALS.IP}:3000/station/${station._id}`,
        updateData
      );

      Alert.alert(
        'Success',
        'Station updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Update station error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update station. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError
        ]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Update Station</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderInput('Station Name *', 'name', 'Enter station name')}
        
        {renderInput('Plug Type *', 'plugType', 'e.g., Type 2, CHAdeMO')}
        
        <View style={styles.rowContainer}>
          {renderInput('Capacity *', 'capacity', 'Number of slots', 'numeric')}
          {renderInput('Available Slots', 'availableSlots', 'Available slots', 'numeric')}
        </View>

        <View style={styles.rowContainer}>
          {renderInput('Longitude *', 'longitude', 'e.g., 10.7965', 'numeric')}
          {renderInput('Latitude *', 'latitude', 'e.g., 32.8064', 'numeric')}
        </View>

        <View style={styles.rowContainer}>
          {renderInput('Power (kW) *', 'kilowatt', 'e.g., 55', 'numeric')}
          {renderInput('Charging Time (min) *', 'chargingTime', 'e.g., 30', 'numeric')}
        </View>

        {renderInput('Price per kWh *', 'pricePerKWh', 'e.g., 20', 'numeric')}

        {renderInput('Supported Vehicles', 'supportedVehicles', 'e.g., Tesla, BMW, Audi (comma separated)')}

        {renderInput('Station Image URL', 'image', 'Enter image URL')}

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Station Status</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>
              {formData.state === 'active' ? '🟢 Active' : '🔴 Inactive'}
            </Text>
            <Switch
              value={formData.state === 'active'}
              onValueChange={(value) => handleInputChange('state', value ? 'active' : 'inactive')}
              trackColor={{ false: '#ccc', true: '#007bff' }}
              thumbColor={formData.state === 'active' ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, loading && styles.updateButtonDisabled]}
          onPress={handleUpdateStation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateButtonText}>Update Station</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  switchContainer: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default UpdateStation;
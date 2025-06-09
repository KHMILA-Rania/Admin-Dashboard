import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../global/variables';

const UserProfile = () => {
  const navigation = useNavigation();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adress: '',
    phoneNumber: '',
    age: '',
    vehicleType: '',
    plugType: '',
    password:''
  });

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

  useEffect(() => {
    const getUserData = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`http://${GLOBALS.IP}:3000/user/${userId}`);
        setUser(response.data.user);
        setFormData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          password:  '',
          address: response.data.user.address || '',
          phoneNumber: response.data.user.phoneNumber || '',
          age: response.data.user.age ? response.data.user.age.toString() : '',
          vehicleType: response.data.user.vehicleType || '',
          plugType: response.data.user.plugType || '',
        });
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [userId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    navigation.navigate('Login');
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.patch(`http://${GLOBALS.IP}:3000/user/${userId}`, formData);
      setUser(response.data.updatedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#223958" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.retryButton}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topSection}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Image
          source={{
            uri:
           
              'https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small_2x/Basic_Ui__28186_29.jpg',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.statusText}>@ {user?.name || 'Active'}</Text>
        <Text style={styles.arrow}>⌄</Text>
      </View>

      <View style={styles.infoSection}>
        <EditableRow
          label="Name"
          value={formData.name}
          editable={isEditing}
          onChangeText={value => handleInputChange('name', value)}
        />
        <EditableRow
          label="Email"
          value={formData.email}
          editable={isEditing}
          onChangeText={value => handleInputChange('email', value)}
        />
         <EditableRow
          label="Password"
          value={isEditing ? formData.password : '********'}
          editable={isEditing}
          onChangeText={value => handleInputChange('password', value)}
        />
        <EditableRow
          label="Address"
          value={formData.address}
          editable={isEditing}
          onChangeText={value => handleInputChange('adress', value)}
        />
        <EditableRow
          label="Phone Number"
          value={formData.phoneNumber}
          editable={isEditing}
          onChangeText={value => handleInputChange('phoneNumber', value)}
        />
        <EditableRow
          label="Age"
          value={formData.age}
          editable={isEditing}
          onChangeText={value => handleInputChange('age', value)}
        />
        <EditableRow
          label="Vehicle Type"
          value={formData.vehicleType}
          editable={isEditing}
          onChangeText={value => handleInputChange('vehicleType', value)}
        />
        <EditableRow
          label="Plug Type"
          value={formData.plugType}
          editable={isEditing}
          onChangeText={value => handleInputChange('plugType', value)}
        />
      </View>

      {isEditing ? (
        <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

     
    </ScrollView>
  );
};

const EditableRow = ({ label, value, editable, onChangeText }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {editable ? (
      <TextInput
        style={styles.inputField}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Enter ${label}`}
      />
    ) : (
      <Text style={styles.detailValue}>{value || 'Not Available'}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E4F4FF',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E4F4FF',
  },
  loadingText: {
    marginTop: 10,
    color: '#223958',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#223958',
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
  },
  topSection: {
    backgroundColor: '#223958',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  statusText: {
    marginTop: 10,
    color: '#B3E5FC',
    fontSize: 16,
    fontStyle: 'italic',
  },
  arrow: {
    marginTop: 10,
    fontSize: 24,
    color: '#fff',
  },
  infoSection: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: '#223958',
    borderRadius: 5,
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  editButton: {
    marginTop: 20,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#05548f',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#388e3c',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#223958',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfile;

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../global/variables';

const Profile = () => {
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
    phone: '',
    
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
        const response = await axios.get(`http://${GLOBALS.IP}:3000/partner/${userId}`);
        setUser(response.data.Partner);
        setFormData({
          name: response.data.Partner.name || '',
            email: response.data.Partner.email || '',
            password: '',
            adress: response.data.Partner.adress || '',
            phone: response.data.Partner.phone?.toString() || '',
           

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
      const response = await axios.patch(`http://${GLOBALS.IP}:3000/partner/${userId}`, formData);
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
  <View style={styles.header}>
    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>‹</Text>
    </TouchableOpacity>

    <Image
      source={{ uri: 'https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small_2x/Basic_Ui__28186_29.jpg' }}
      style={styles.profileImage}
    />
    <Text style={styles.userName}>{user?.name}</Text>
    <Text style={styles.userEmail}>{user?.email}</Text>
  </View>

  <View style={styles.cardContainer}>
    <EditableRow label="Name" value={formData.name} editable={isEditing} onChangeText={value => handleInputChange('name', value)} />
    <EditableRow label="Email" value={formData.email} editable={isEditing} onChangeText={value => handleInputChange('email', value)} />
    <EditableRow label="Password" value={isEditing ? formData.password : '********'} editable={isEditing} onChangeText={value => handleInputChange('password', value)} />
    <EditableRow label="Address" value={formData.adress} editable={isEditing} onChangeText={value => handleInputChange('adress', value)} />
    <EditableRow label="Phone Number" value={formData.phone} editable={isEditing} onChangeText={value => handleInputChange('phone', value)} />
  </View>

  <View style={styles.buttonContainer}>
    {isEditing ? (
      <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
        <Text style={styles.editText}>Edit Profile</Text>
      </TouchableOpacity>
    )}
   
  </View>
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
    backgroundColor: '#f2f6fc',
    paddingBottom: 60,
  },
  header: {
    backgroundColor: '#587ba5',
    paddingVertical: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
  },
  backButtonText: {
    fontSize: 18,
    color: '#587ba5',
    fontWeight: 'bold',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#e0f7fa',
  },
  cardContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  detailRow: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    color: '#223958',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#39B2DB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
  },
});


export default Profile;

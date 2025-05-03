import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
      } catch (err) {
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [userId]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    navigation.navigate('Login');
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
              user.profileImageUrl ||
              'https://static.vecteezy.com/system/resources/thumbnails/000/439/863/small_2x/Basic_Ui__28186_29.jpg',
          }}
          style={styles.profileImage}
        />
        <Text style={styles.statusText}>@ {user.name || 'Active'}</Text>
        <Text style={styles.arrow}>⌄</Text>
      </View>

      <View style={styles.infoSection}>
        <InfoRow label="ID" value={userId || 'Not Available'} />
        <InfoRow label="Name" value={user.name || 'Not Available'} />
        <InfoRow label="Email" value={user.email || 'Not Available'} />
        {/* ⚠ Never display passwords */}
        <InfoRow label="Address" value={user.adress || 'Not Available'} />
        <InfoRow label="Phone Number" value={user.phoneNumber || 'Not Available'} />
        <InfoRow label="Age" value={user.age ? `${user.age} years` : 'Not Available'} />
        <InfoRow label="Vehicle Type" value={user.vehicleType || 'Not Available'} />
        <InfoRow label="Plug Type" value={user.plugType || 'Not Available'} />
        
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
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
  logoutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f44336',
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

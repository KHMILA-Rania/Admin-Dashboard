import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNavBar from './BottomNavBar'; // Import the BottomNavBar component
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState,useEffect } from 'react';

const HomePartner = () => {
    const [userType, setUserType] = useState('user');
     const [userName, setUserName] = useState('User');
      const [userID, setUserID] = useState('');

      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
    });
  const handleTabPress = (tabKey) => {
    console.log('Tab pressed:', tabKey); 
  };
  const navigation = useNavigation();
  const handleLogout = async () => {
       try {
         await AsyncStorage.clear();
         navigation.reset({
           index: 0,
           routes: [{ name: 'SignIn' }],
         });
       } catch (error) {
         console.error('Error during logout:', error);
       }
     };


      useEffect(() => {
    const initialize = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserType = await AsyncStorage.getItem('userType');
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserID(storedUserId);
        console.log('User ID:', storedUserId);

        if (storedToken) {
          const userData = JSON.parse(storedToken);
          setUserName(userData?.name || 'User');
        }
        if (storedUserType) {
          setUserType(storedUserType);
        }

      
   
       
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    initialize();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}
        onPress={()=>handleLogout()}>
          <Text style={styles.backArrow}>Logout</Text>
        </TouchableOpacity>
   
                <Text style={styles.title}>Welcome, {userName}!</Text>
            
        <TouchableOpacity style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Last Update */}
        <Text style={styles.lastUpdate}> Date: {formattedDate}</Text>

        {/* Earnings Cards */}
        <View style={styles.earningsSection}>
          <View style={[styles.earningCard, styles.totalEarning]}>
            <Text style={styles.cardLabel}>TOTAL EARNING</Text>
            <Text style={styles.cardAmount}>₹ 5,25,000</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.earningCard, styles.received]}>
              <Text style={styles.cardLabel}>RECEIVED</Text>
              <Text style={styles.cardAmount}>₹ 4,50,000</Text>
            </View>
            <View style={[styles.earningCard, styles.due]}>
              <Text style={styles.cardLabel}>DUE</Text>
              <Text style={styles.cardAmount}>₹ 75,000</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>ALL JOBS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>7</Text>
              <Text style={styles.statLabel}>INVOICES</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>6</Text>
              <Text style={styles.statLabel}>RECOGNITION</Text>
            </View>
          </View>
        </View>

        {/* Invoice Items */}
        <View style={styles.invoiceSection}>
          <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceName}>RAHUL MEHRA</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.invoiceSubtitle}>WS TOWERS, ACE ENTERPRISES</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.completedText}>COMPLETED</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>SHARE INVOICE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceName}>HARSHIL CHAUHAN</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.invoiceSubtitle}>RCR VENTURES, ACE ENTERPRISES</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
              <Text style={styles.progressText}>80% COMPLETED</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Text style={styles.shareButtonText}>SHARE INVOICE</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceName}>VIMAL GAJRI</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavBar 
        activeTab="HOME/MAIN" 
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdate: {
   fontSize: 14,
    color: '#666',
    marginTop: 10,
    paddingBottom:20
  },
  earningsSection: {
    marginBottom: 20,
  },
  earningCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  totalEarning: {
    backgroundColor: '#ffe4b5',
  },
  received: {
    backgroundColor: '#e8f5e9',
    flex: 1,
    marginRight: 7.5,
  },
  due: {
    backgroundColor: '#fce4ec',
    flex: 1,
    marginLeft: 7.5,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  statsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
    fontWeight: '600',
  },
  invoiceItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  invoiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdown: {
    padding: 5,
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#666',
  },
  invoiceSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  completedText: {
    fontSize: 10,
    color: '#4caf50',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#e91e63',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#e91e63',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HomePartner;
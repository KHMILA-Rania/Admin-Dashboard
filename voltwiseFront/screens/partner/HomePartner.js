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
import GLOBALS from '../../global/variables';
const HomePartner = () => {
    const [userType, setUserType] = useState('user');
     const [userName, setUserName] = useState('User');
    const [userID, setUserID] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
    const [complaintsCount, setComplaintsCount] = useState(0);
    const [stationsCount, setStationsCount] = React.useState(0);

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




   useEffect(() => {
    if (!userID) return;
    const fetchComplaints = async () => {
      try {

        const response = await fetch(`http://${GLOBALS.IP}:3000/complaint/`);
        const data = await response.json();
     
        const assignedComplaints = data.filter(
          (complaint) => complaint.assignedPartnerId === userID
        );

        const total = assignedComplaints.length;
        const pending = assignedComplaints.filter(c => c.status === 'pending').length;
        const resolved = assignedComplaints.filter(c => c.status === 'resolved').length;

        setComplaintsCount(total);
        setPendingCount(pending);
        setResolvedCount(resolved);

       
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
    fetchComplaints();
  }, [userID]);

  useEffect(() => {
  if (!userID) return;

  const fetchStations = async () => {
    try {
      const response = await fetch(`http://${GLOBALS.IP}:3000/station/`);
      const data = await response.json();

      console.log('Type of userID:', typeof userID, 'value:', userID);

      if (!Array.isArray(data)) {
        console.warn('Expected stations array but got:', data);
        return;
      }

     const ownedStations = data.filter(station => {
    const ownerId = typeof station.owner === 'object' 
    ? station.owner?._id 
    : station.owner;
     return String(ownerId) === String(userID);
});

      console.log('Owned Stations:', ownedStations);

      // You can set state here to store stations count or list
      setStationsCount(ownedStations.length);
      // or setStations(ownedStations); if you want full list

    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  fetchStations();
}, [userID]);



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
            <Text style={styles.cardLabel}>TOTAL COMPLAINTS</Text>
            <Text style={styles.cardAmount}>{complaintsCount}</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.earningCard, styles.received]}>
              <Text style={styles.cardLabel}>RECEIVED</Text>
              <Text style={styles.cardAmount}>{pendingCount}</Text>
            </View>
            <View style={[styles.earningCard, styles.due]}>
              <Text style={styles.cardLabel}>RESOLVED</Text>
              <Text style={styles.cardAmount}>{resolvedCount}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stationsCount}</Text>
              <Text style={styles.statLabel}>All Stations</Text>
            </View>
          
            <View style={styles.statItem}>
              <TouchableOpacity style={styles.stationsBtn} onPress={() => navigation.navigate('Stations')}>
                <Text style={styles.statNumber}>Go to list</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Invoice Items */}
        <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceName}>All complaints</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.invoiceSubtitle}>{complaintsCount}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.progressText}></Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('AssignedComplaints')}>
              <Text style={styles.shareButtonText}>Go to Complaints</Text>
            </TouchableOpacity>
          </View>

        <View style={styles.invoiceSection}>
          <View style={styles.invoiceItem}>
            <View style={styles.invoiceHeader}>
              <Text style={styles.invoiceName}>All Stations</Text>
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.invoiceSubtitle}>{stationsCount}</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              <Text style={styles.completedText}></Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={() => navigation.navigate('Stations')}>
              <Text style={styles.shareButtonText}>Go to stations</Text>
            </TouchableOpacity>
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
  stationsBtn:{
    borderWidth: 1,
    borderColor: '#468fbf',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 30,
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
   fontSize: 18,
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
    padding: 30,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  totalEarning: {
    backgroundColor: '#92b7cf',
  },
  received: {
    backgroundColor: '#e8f5e9',
    flex: 1,
    marginRight: 7.5,
  },
  due: {
    backgroundColor: '#e5c4fb',
    flex: 1,
    marginLeft: 7.5,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardLabel: {
    fontSize: 15,
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
    borderRadius: 5,
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
    fontSize: 15,
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
    borderColor: '#286ea5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#286ea5',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default HomePartner;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../global/variables';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null); // To store the user ID
    
    const navigation = useNavigation();

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
        const fetchComplaints = async () => {
            try {
                const response = await axios.get(`http://${GLOBALS.IP}:3000/complaint/user/${userId}`);
                setComplaints(response.data.complaints);
            } catch (err) {
                setError('Failed to load complaints or no complaints found');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchComplaints();
        }
    }, [userId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Complaints</Text>
            {complaints.length === 0 ? (
                <Text>You have no complaints.</Text>
            ) : (
                <FlatList
                    data={complaints}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.complaintItem}>
                            <Text style={styles.subject}>{item.subject}</Text>
                            <Text>{item.description}</Text>
                            <Text style={styles.status}>Status: {item.status}</Text>
                            <Text style={styles.date}>Created at: {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    )}
                />
            )}
  
                <TouchableOpacity
                style={styles.fabContainer}
                onPress={() => navigation.navigate('Complaint')}  // 👈 Adjust route name
                >
                <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>


        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#F8FAFC',
  },
  title: {
     fontSize: 28,
  fontWeight: 'bold',
  marginBottom: 20,
  textAlign: 'center',
  color: '#14939C',
  borderBottomWidth: 2,
  borderColor: '#14939C',
  paddingBottom: 8,
  marginHorizontal: 40,
  },
  complaintItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#14939C',
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
    color: '#14939C',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  fabContainer: {
  position: 'absolute',
  bottom: 30,
  right: 30,
  backgroundColor: '#14939C',
  width: 60,
  height: 60,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
},
fabText: {
  fontSize: 30,
  color: 'white',
  lineHeight: 34,
},

});



export default ComplaintsList;

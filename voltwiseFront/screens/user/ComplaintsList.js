import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GLOBALS from '../../global/variables';

const ComplaintsList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null); // To store the user ID
    // Adjust this if needed

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
                setError('Failed to load complaints');
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
                            <Text>Status: {item.status}</Text>
                            <Text>Created at: {new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f2f4f7',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#14939C',
    },
    complaintItem: {
        marginBottom: 16,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 7,
        shadowColor: '#15AEFA',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    subject: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
        color: '#14939C',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f2f4f7',
    },
});


export default ComplaintsList;

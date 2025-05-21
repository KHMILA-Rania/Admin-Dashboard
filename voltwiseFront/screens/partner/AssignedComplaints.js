import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import GLOBALS from '../../global/variables';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // complaint ID being updated

  useEffect(() => {
    const fetchAssignedComplaints = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.warn('User ID not found in AsyncStorage.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://${GLOBALS.IP}:3000/complaint/`);

        const filteredComplaints = response.data.filter(
          complaint => complaint.assignedPartnerId === userId
        );

        setComplaints(filteredComplaints);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    setUpdating(complaintId);
    try {
      await axios.patch(`http://${GLOBALS.IP}:3000/complaint/${complaintId}/status`, {
        status: newStatus,
      });

      setComplaints(prev =>
        prev.map(complaint =>
          complaint._id === complaintId ? { ...complaint, status: newStatus } : complaint
        )
      );
      console.log(`Status updated to ${newStatus} for complaint ID: ${complaintId}`);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (complaints.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No complaints assigned to you.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={complaints}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>🛠️ {item.subject}</Text>
          <Text style={styles.detail}>📄 {item.description}</Text>
          <Text style={styles.detail}>📅 {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'No date provided'}</Text>

          <Text style={styles.statusLabel}>Status:</Text>
          <Picker
            selectedValue={item.status}
            style={styles.picker}
            enabled={updating !== item._id}
            onValueChange={(value) => handleStatusChange(item._id, value)}
          >
            <Picker.Item label="Pending" style={styles.pickerItem} value="pending" />
            <Picker.Item label="Resolved" style={styles.pickerItem} value="resolved" />
            <Picker.Item label="Closed" style={styles.pickerItem} value="closed" />
          </Picker>
        </View>
      )}
    />
  );
};

export default AssignedComplaints;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    marginTop: 6,
    fontSize: 14,
    color: '#444',
  },
  statusLabel: {
    marginTop: 8,
    fontWeight: '600',
      color: "#468fbf",
  },
  picker: {
    height: 50,
    marginTop: 4,
    backgroundColor: '#468fbf',
    borderRadius: 8,
 
  },
  pickerItem: {
  fontSize: 12,
  paddingBottom:10 // This affects the dropdown and selected text on Android
},
});

// filepath: c:\voltwise\voltWiseApp\components\CustomBottomBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { memo } from 'react'; // Import memo for performance optimization

const CustomBottomBar = memo(() => {
    console.log('CustomBottomBar rendered'); // Debug log
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
       
      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('HomeUser')}
      >
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => navigation.navigate('userProfile')}
      >
        <Text style={styles.tabText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
       
      >
        <Text style={styles.tabText}  onPress={() => navigation.navigate('Complaint')}>Complaint</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
       
      >
        <Text style={styles.tabText}  onPress={() => navigation.navigate('StationList')}>Stations</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Arrange tabs horizontally
    justifyContent: 'space-around', // Space tabs evenly
    alignItems: 'center', // Center items vertically
    height: 60, // Height of the bottom bar
    backgroundColor: '#223958', // Background color of the bar
    borderTopWidth: 1, // Add a border at the top
    borderTopColor: '#ddd', // Border color
    position: 'absolute', // Fix it to the bottom
    bottom: 0, // Align to the bottom of the screen
    width: '100%', // 
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CustomBottomBar;
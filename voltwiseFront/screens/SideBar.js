// Sidebar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Sidebar = ({ navigation }) => {
  return (
    <View style={styles.sidebarContainer}>
      <Text style={styles.title}></Text>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Sign-Up')}>
        <Text style={styles.menuText}>Contact Info</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Sign-Up')}>
        <Text style={styles.menuText}>About Us</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: '#f8f8f8',
    width: 250,
    paddingTop: 30,
    paddingLeft: 20,
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 18,
  },
});

export default Sidebar;

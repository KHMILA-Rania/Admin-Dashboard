import React from 'react';
import { View, Text, StyleSheet,TouchableOpacity,Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
const AboutUs = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                      <Image
                        source={require('../assets/icons/back-icon.png')} 
                        style={styles.backIcon}
                      />
                    </TouchableOpacity>
                    <Image source={require('../assets/voltwiselogo.png')}></Image>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.description}>
        Welcome to our app! We are dedicated to providing the best experience for our users. 
        Our mission is to make things simple, efficient, and enjoyable for everyone.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    backIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        position: ''
      },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default AboutUs;

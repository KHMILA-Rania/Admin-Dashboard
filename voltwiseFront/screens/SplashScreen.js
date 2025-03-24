import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home'); // Navigate to Home screen after 3s
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/voltwiselogo.png')} style={styles.logo} />
      <Text style={styles.text}>Welcome to My App</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 100,
    height: 100,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;

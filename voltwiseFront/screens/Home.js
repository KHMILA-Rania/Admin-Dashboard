import React, { useState, useEffect, useCallback ,useRef} from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, BackHandler, Alert,SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Sidebar from './SideBar';
import AnimatedSlogan from './useful/SloganAnimation';
const Home = () => {
 
  const [sidebarVisible, setSidebarVisible] = useState(false); 
  const [isScrolled, setIsScrolled] = useState(false); 
  const navigation = useNavigation();

  // Fetch user data
  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({ type: 'error', text1: 'No token found, please login!' });
        return;
      }

      const response = await axios.post('http://192.168.1.30:5001/userdata', { token });
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({ type: 'error', text1: 'Failed to fetch user data' });
    }
  };

  // Handle back button press
  const handleBackPress = useCallback(() => {
    Alert.alert('Exit App', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', onPress: () => BackHandler.exitApp() },
    ]);
    return true;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getData();
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => {
        subscription.remove();
      };
    }, [handleBackPress])
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    Toast.show({ type: 'success', text1: 'Logged out successfully!' });
    navigation.replace('SignIn');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Handle scroll event to detect if user is scrolling
  const handleScroll = (event) => {
    if (event.nativeEvent.contentOffset.y > 0) {
      setIsScrolled(true); 
    } else {
      setIsScrolled(false); 
    }
  };

  return (
    <View style={styles.container}>
  
      {sidebarVisible && <Sidebar navigation={navigation} />}

      {/* Main Content Area */}
      <View style={[styles.mainContent, { marginLeft: sidebarVisible ? 250 : 0 }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16} 
        >
          <View style={styles.header}>

            {/* Back Button*/}
         

          </View>

          <View style={styles.logoContainer}>
            <Image source={require('../assets/voltwiselogo.png')} style={styles.logo} />
            <SafeAreaView style={{ flex: 1 }}>
      <AnimatedSlogan />
    </SafeAreaView>
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresText}>Discover our features</Text>
          </View>

          {/* Cards Section */}
          <View style={styles.cards}>
            {/* 1st Feature */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardContainer}>
                <Text style={styles.cardText}>Time gaining, know your next station</Text>
                <Image style={styles.cardImg} source={require('../assets/features/map.jpg')} />
                <Text style={styles.cardDescription}>
                  With our interactive maps, navigating your way through key locations has never been easier. 
                  We’ll provide real-time maps that guide you to the nearest stations 
                  to help you make your journey smoother and more efficient.
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2nd Feature */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardContainer}>
                <Text style={styles.cardText}>Station Reservation</Text>
                <Image style={styles.cardImg} source={require('../assets/features/reservation.jpg')} />
                <Text style={styles.cardDescription}>
                  Reserve a charging station in advance to avoid waiting times. 
                  Plan your trip efficiently with real-time availability updates.
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3rd Feature */}
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardContainer}>
                <Text style={styles.cardText}>Online Payment System</Text>
                <Image style={styles.cardImg} source={require('../assets/features/payment.png')} />
                <Text style={styles.cardDescription}>
                  Enjoy seamless, secure payments through our integrated payment system. 
                  Pay directly from the app with multiple payment options.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Follow us on Twitter | Instagram | Facebook {"\n"}
            © 2025 VoltWise. All rights reserved.
          </Text>
        </View>
      </View>

      {/* Fixed Background and Buttons */}
      <View style={styles.fixedButtonsContainer}>
        <View
          style={[
            styles.buttonsBackground,
          ]}
        >
          <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
            <Image source={require('../assets/icons/toggle.png')} style={styles.toggleIcon} />
          </TouchableOpacity>

          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slogan: {
    textAlign: 'center',
 
    fontWeight: 'bold',
    color: '#569de6',
    fontSize: 18,
    letterSpacing:1.6,
    textTransform: 'uppercase',
    marginVertical:5
  },
 
  container: {
    flex: 1,
    flexDirection: 'row', 
    backgroundColor: '#f0f0f0',
  },
  topnav: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  topnavRight: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1, 
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 10,
    transition: 'margin-left 0.3s ease', 
      backgroundColor: '#f0f0f0'
  },
  scrollView: {
    flex: 1, 
    backgroundColor: '#f0f0f0',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  logoContainer: {
    marginTop: 20,
    alignItems:'center',
    justifyContent: 'center',
    width: '100%',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  loginContainer: {
    marginTop: 30,
  },
 
  loginText: {
    color: 'gray',
    fontSize: 16,
  },
  featuresSection: {
    marginTop: 20,
    alignItems: 'center',
   
  },
  featuresText: {
    fontSize: 28, // Large font size for emphasis
    fontWeight: "bold",
    color: "gray", // Green color to match your theme
    textAlign: "center",
    letterSpacing: 1.5, // Slight spacing between letters for a modern look
    textTransform: "uppercase", // Uppercase letters for more impact
    paddingVertical: 10, // Padding around the text for more space
    // Shadow effect for a 3D look
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  
   
  },
  cards: {
    marginTop: 20,
  },
  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 4,
  },
  cardContainer: {
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardImg: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#d3d3d3',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerText: {
    color: "#555",
    fontSize: 14,
    textAlign: 'center',
  },
  fixedButtonsContainer: {
    position: 'absolute',
    top: 0, 
    left: 0,
    width: '100%',
    zIndex: 10, 
  },
  buttonsBackground: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    width: '100%',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 10,
  },
  toggleIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  loginButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
  },
});

export default Home;

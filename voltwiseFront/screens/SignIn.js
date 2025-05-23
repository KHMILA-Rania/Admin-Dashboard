import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { IconButton } from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import style from './style';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Don't forget to import AsyncStorage
import GLOBALS from '../global/variables';
function SignIn({props}) {

  const navigation = useNavigation(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const goHome=()=>{
    navigation.navigate('Home');
  }

  useEffect(() => {
    checkLoginStatus();
  }, []);



  async function checkLoginStatus() {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigation.navigate('HomeUser');
    }
  }

  

const HandleSubmit = async () => {
  try {
    const userData = {
      email: email.trim(),
      password: password.trim(),
    };

    const res = await axios.post(`http://${GLOBALS.IP}:3000/auth/login`, userData);
    console.log('Response Data:', res.data);

    if (res.data.status === 'ok' || res.data.status === 200) {
      console.log('Logged in successfully');
      Alert.alert('Logged In Successfully');

      // Store user data
      await AsyncStorage.setItem('token', JSON.stringify(res.data.data));
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      
      const userId = res.data.data._id;
      console.log('User ID:', userId);
      await AsyncStorage.setItem('userId', userId);
      
      // Get account type from response
      const accountType = res.data.accountType; // 'user' or 'partner'
      await AsyncStorage.setItem('accountType', accountType);
      console.log('Account type:', accountType);
      
      // Extract role info as before
      const userType = res.data.data.role?.[0]?.name; // Safe access
      if (userType) {
        await AsyncStorage.setItem('userType', userType);
        console.log('User type stored:', userType);
      } else {
        console.warn('User role is missing in response.');
      }

      // Navigate based on account type
      if (accountType === 'partner') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomePartner' }],
        });
      } else {
        // Default to HomeUser for regular users
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeUser' }],
        });
      }
    } else {
      console.log('Login failed');
      Alert.alert('Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Error during login:', err);
    
    // More detailed error handling
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = err.response.data || 'Login failed. Please check your credentials.';
      Alert.alert('Login Error', errorMessage);
    } else if (err.request) {
      // The request was made but no response was received
      Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    }
  }
};
  
  

  

  // Check if the user is logged in when the component mounts
  async function getData() {
    const data = await AsyncStorage.getItem('isLoggedIn');
    console.log('Is Logged In:', data); // Debugging: Log current login status
  }

  useEffect(() => {
    getData(); // Call getData when the component mounts
    console.log('Component mounted'); // Debugging: Log component mount
  }, []); // Empty dependency array to run only once on mount

  return (
    <ScrollView
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps={'always'}>
      <View style={{backgroundColor: '#39B2DB'}}>
        <View style={style.logoContainer}>
          <Image
            style={style.logo}
            source={require('../assets/white.png')}
          />
      
        </View>
        <View style={style.loginContainer}>
          <Text style={style.text_header}>Welcome Back</Text>
          <Text style={{color: 'gray', fontWeight: '900', textAlign:'center', marginBottom: 20 , marginTop: 10}}>
            Login to your account</Text>
          <View style={style.action}>
            <FontAwesome
              name="user-o"
              color="#420475"
              style={style.smallIcon}
            />
            <TextInput
              placeholder="Email"
              style={style.textInput}
              placeholderTextColor="gray" 
              onChange={e => setEmail(e.nativeEvent.text)}
            />
          </View>
          <View style={style.action}>
            <FontAwesome name="lock" color="#420475" style={style.smallIcon} />
            <TextInput
              placeholder="Password"
              secureTextEntry={true}
              style={[style.textInput, {flex: 1, paddingLeft: 10}]}
              placeholderTextColor="gray" 
              onChange={e => setPassword(e.nativeEvent.text)}
            />
            
            <TouchableOpacity onPress={
              () => setHidePassword(!hidePassword)}>
              <Feather name={hidePassword ? 'eye-off' : 'eye'} size={20} color="gray" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginTop: 8,
              marginRight: 10,
            }}>
            <Text style={{color: 'gray', fontWeight: '700'}} onPress={()=>navigation.navigate('ResetPassword')}>Forgot Password</Text>
           <TouchableOpacity style={style.inBut} onPress={HandleSubmit}>
            <View>
              <Text style={style.textSign}>Log in</Text>
            </View>
          </TouchableOpacity>
          </View>
        </View>
        <View style={style.button}>
         
       
          <View style={{padding: 15}}>
            <Text style={{fontSize: 14, fontWeight: 'bold', color: 'white',marginTop: 10, textAlign:'center'}}>
              ----Or Continue as----
            </Text>
          </View>
          <View style={style.bottomButton}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity style={style.inBut2} onPress={goHome}>
              <Image
                source={require('../assets/invite-vedette.png')} // Path to your image
                style={{ width: 20, height: 20 }}
              />
              </TouchableOpacity>
              <Text style={style.bottomText}>Guest</Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={style.inBut2}
                onPress={() => {
                  navigation.navigate('SignUp');
                }}>
               <Image
                source={require('../assets/apps-add.png')} // Path to your image
                style={{ width: 20, height: 20 }}
              />
 
              </TouchableOpacity>
              <Text style={style.bottomText}>Sign Up</Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={style.inBut2}
                onPress={() => alert('Coming Soon')}>
               <Image
                source={require('../assets/google.png')} // Path to your image
                style={{ width: 20, height: 20 }}
              />
              </TouchableOpacity>
              <Text style={style.bottomText}>Google</Text>
            </View>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity
                style={style.inBut2}
                onPress={() => alert('Coming Soon')}>
                   <Image
                source={require('../assets/facebook.png')} // Path to your image
                style={{ width: 20, height: 20 }}
              />
              </TouchableOpacity>
              <Text style={style.bottomText}>Facebook</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default SignIn;
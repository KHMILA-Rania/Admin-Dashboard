import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import style from './style';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useEffect, useState} from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Don't forget to import AsyncStorage

function SignIn({props}) {
  const navigation = useNavigation(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

 
  function handleSubmit() {
    console.log('Email:', email); // Debugging: Log email
    console.log('Password:', password); // Debugging: Log password
    const userData = {
      email: email.trim(),
      password: password.trim(),
    };
    console.log('UserData being sent:', userData);

    // Send post request to login endpoint
    axios
      .post('http://192.168.1.201:3000/auth/login', userData)
      .then(res => {
        console.log('Response:', res); // Debugging: Log the response
        console.log('Response Data:', res.data); // Debugging: Log the response
        if (res.data.status === 'ok' || res.data.status === 200) {
          console.log('Logged in successfully'); // Debugging: Log success
          Alert.alert('Logged In Successfully');
          AsyncStorage.setItem('token', res.data.data); // Store token
          AsyncStorage.setItem('isLoggedIn', JSON.stringify(true)); // Store login state
          AsyncStorage.setItem('userType', res.data.userType); // Store user type
          console.log('Token stored:', res.data.data); // Debugging: Log token stored
          console.log('User type stored:', res.data.userType); // Debugging: Log user type stored
          
          // Log the navigation object to check if it's working
          console.log('Navigation object:', navigation);

          // Navigate to Home screen after successful login
          navigation.navigate('Home');
        } else {
          console.log('Login failed'); // Debugging: Log failure
          Alert.alert('Login failed. Please check your credentials.');
        }
      })
      .catch(err => {
        console.error('Error during login:', err); // Debugging: Log any errors
        Alert.alert('An error occurred during login. Please try again.');
      });
  }

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
      <View style={{backgroundColor: 'white'}}>
        <View style={style.logoContainer}>
          <Image
            style={style.logo}
            source={require('../assets/voltwiselogo.png')}
          />
        </View>
        <View style={style.loginContainer}>
          <Text style={style.text_header}>Login !!!</Text>
          <View style={style.action}>
            <FontAwesome
              name="user-o"
              color="#420475"
              style={style.smallIcon}
            />
            <TextInput
              placeholder="Mobile or Email"
              style={style.textInput}
              onChange={e => setEmail(e.nativeEvent.text)}
            />
          </View>
          <View style={style.action}>
            <FontAwesome name="lock" color="#420475" style={style.smallIcon} />
            <TextInput
              placeholder="Password"
              style={style.textInput}
              onChange={e => setPassword(e.nativeEvent.text)}
            />
          </View>
          <View
            style={{
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginTop: 8,
              marginRight: 10,
            }}>
            <Text style={{color: 'gray', fontWeight: '700'}}>Forgot Password</Text>
          </View>
        </View>
        <View style={style.button}>
          <TouchableOpacity style={style.inBut} onPress={handleSubmit}>
            <View>
              <Text style={style.textSign}>Log in</Text>
            </View>
          </TouchableOpacity>

          <View style={{padding: 15}}>
            <Text style={{fontSize: 14, fontWeight: 'bold', color: '#919191'}}>
              ----Or Continue as----
            </Text>
          </View>
          <View style={style.bottomButton}>
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <TouchableOpacity style={style.inBut2}>
                <FontAwesome
                  name="user-circle-o"
                  color="white"
                  style={style.smallIcon2}
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
                <FontAwesome
                  name="user-plus"
                  color="white"
                  style={[style.smallIcon2, {fontSize: 30}]}
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
                <FontAwesome
                  name="google"
                  color="white"
                  style={[style.smallIcon2, {fontSize: 30}]}
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
                <FontAwesome
                  name="facebook-f"
                  color="white"
                  style={[style.smallIcon2, {fontSize: 30}]}
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

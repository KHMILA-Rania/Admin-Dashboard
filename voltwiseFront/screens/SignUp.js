
import React, { useState } from "react";
import { Text, View,TextInput, TouchableOpacity, StyleSheet ,Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import style from "./style";
import GLOBALS from "../global/variables";
function SignUp(){
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
     const [address, setAddress] = useState('');
     const [phoneNumber, setPhoneNumber] = useState('');
     const [age, setAge] = useState('');
     const [vehicleType, setVehicleType] = useState('');
    const [plugType, setPlugType] = useState('');


    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
        if (!emailRegex.test(email)) {
          setEmailError("Invalid email format");
        } else {
          setEmailError(""); // Clear the error if valid
        }
      };


      const handleSubmit = async () => {
        try {
          // Check if all fields are filled
          if (!name || !email || !password || !address || !phoneNumber || !age) {
            Alert.alert('Please fill in all fields');
            return;
          }
    
          // Prepare data to send
          const userData = {
            name,
            email,
            password,
            address,
            phoneNumber,
            age,
            vehicleType,
            plugType,
          };
    
          // Make the API request to register the user
          const response = await axios.post(`http://${GLOBALS.IP}:3000/auth/register`, userData);
    
          // Check the response and handle accordingly
          if (response.status === 200) {
            Alert.alert('Registration Successful');
            // Redirect to sign in screen after successful registration
            navigation.navigate('SignIn');
          } else {
            Alert.alert('Registration failed', response.data.message || 'Try again later');
          }
        } catch (error) {
          console.error('Error during registration:', error);
          Alert.alert('An error occurred during registration. Please try again.');
        }
      };
   
  

    return(
      <ScrollView>
        <View style={styles.container}>
        <Text style={style.text_header}>Sign Up</Text>
        <Text style={{color: 'gray', fontWeight: '900', textAlign:'center', marginBottom: '20' , marginTop: '10'}}>sign up and accelerate your experience!</Text>
  <View style={styles.containerSignUP}>

        <Text style={styles.InputLabel}>Name</Text>
        <View style={style.action}>
        <TextInput
           style={style.textInput}
          placeholder="Name"
          placeholderTextColor={'gray'}
          value={name}
          onChangeText={setName}
        />
        </View>

      <Text style={styles.InputLabel}>email</Text>
      <View style={style.action}>
              
              <TextInput
                style={style.textInput}
                placeholder="Email"
                placeholderTextColor={'gray'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
      </View>


        <Text style={styles.InputLabel}>password</Text>

        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Password"
          placeholderTextColor={'gray'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        </View>
        <Text style={styles.InputLabel}>Address</Text>

        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Address"
          placeholderTextColor={'gray'}
          value={address}
          onChangeText={setAddress}
        />
      </View>
        <Text style={styles.InputLabel}>Phone number</Text>
        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Phone Number"
          value={phoneNumber}
          placeholderTextColor={'gray'}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
        <Text style={styles.InputLabel}>Age</Text>
        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Age"
          placeholderTextColor={'gray'}
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        </View>

        <Text style={styles.InputLabel}>Vehicle Type (Optional)</Text>
        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Vehicle Type (Optional)"
          placeholderTextColor={'gray'}
          value={vehicleType}
          onChangeText={setVehicleType}
        />
        </View>

        <Text style={styles.InputLabel}>Plug Type (Optional)</Text>
        <View style={style.action}>
        <TextInput
          style={style.textInput}
          placeholder="Plug Type (Optional)"
          value={plugType}
          placeholderTextColor={'gray'}
          onChangeText={setPlugType}
        />
    </View>
    </View>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={[style.inBut, { color: 'white',textAlign:'center', fontWeight:'900'},style.textSign]}>Register</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    );
    
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    input: {
     
     
    },
    button: {
 
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    containerSignUP:{
     
      backgroundColor: "#F0F8FF",
      borderRadius: 50,
      marginVertical:15,
      marginHorizontal: 10,
      paddingHorizontal: 20,
      borderColor: 'black',  
      borderWidth: 0.1, 
      paddingVertical:20,
    },
    InputLabel:{
      fontSize: 16,
      color: 'black',
      marginTop: 5,
      marginBottom: 0,
    }
  });
export default SignUp
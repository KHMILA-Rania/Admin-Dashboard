
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
const [nameError, setNameError] = useState('');
const [passwordError, setPasswordError] = useState('');
const [addressError, setAddressError] = useState('');
const [phoneNumberError, setPhoneNumberError] = useState('');
const [ageError, setAgeError] = useState('');


const validateFields = () => {
  let valid = true;

  if (!name.trim()) {
    setNameError("Name is required");
    valid = false;
  } else {
    setNameError("");
  }

  if (!email.trim()) {
    setEmailError("Email is required");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError("Invalid email format");
    valid = false;
  } else {
    setEmailError("");
  }

  if (!password.trim()) {
    setPasswordError("Password is required");
    valid = false;
  } else {
    setPasswordError("");
  }

  if (!address.trim()) {
    setAddressError("Address is required");
    valid = false;
  } else {
    setAddressError("");
  }

  if (!phoneNumber.trim()) {
    setPhoneNumberError("Phone number is required");
    valid = false;
  } else if (!/^\d{8,15}$/.test(phoneNumber)) {
    setPhoneNumberError("Invalid phone number");
    valid = false;
  } else {
    setPhoneNumberError("");
  }

  if (!age.trim()) {
    setAgeError("Age is required");
    valid = false;
  } else if (isNaN(age) || parseInt(age) <= 0) {
    setAgeError("Age must be a positive number");
    valid = false;
  } else {
    setAgeError("");
  }

  return valid;
};


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
           if (!validateFields()) return;
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
        {nameError ? <Text style={{ color: 'red', fontSize: 12 }}>{nameError}</Text> : null}

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

{emailError ? <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text> : null}
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
         {passwordError ? <Text style={{ color: 'red', fontSize: 12 }}>{passwordError}</Text> : null}
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
       {addressError ? <Text style={{ color: 'red', fontSize: 12 }}>{addressError}</Text> : null}
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
       {phoneNumberError ? <Text style={{ color: 'red', fontSize: 12 }}>{phoneNumberError}</Text> : null}
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
 {ageError ? <Text style={{ color: 'red', fontSize: 12 }}>{ageError}</Text> : null}
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

         <Text style={{color: 'black', fontWeight: '500', textAlign:'center', marginBottom: '20' , marginTop: '10'}}>By filling this form you're creating a Client account,future partners should contact the Admin</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ContactUs')}>
          <Text style={{color: 'blue', fontWeight: '500', textAlign:'center', marginBottom: '20' , marginTop: '10'}}>Contact us for more information</Text>
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
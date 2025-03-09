
import React, { useState } from "react";
import { Text, View,TextInput, TouchableOpacity, StyleSheet ,Alert, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';

function SignUp(){
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
     const [adress, setAdress] = useState('');
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
          if (!name || !email || !password || !adress || !phoneNumber || !age) {
            Alert.alert('Please fill in all fields');
            return;
          }
    
          // Prepare data to send
          const userData = {
            name,
            email,
            password,
            adress,
            phoneNumber,
            age,
            vehicleType,
            plugType,
          };
    
          // Make the API request to register the user
          const response = await axios.post('http://192.168.1.201:3000/auth/register', userData);
    
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
        <View style={styles.container}>
        <Text style={styles.header}>Sign Up</Text>
        <Text>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />

        <Text>email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text>password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Text>Adress</Text>

        <TextInput
          style={styles.input}
          placeholder="Address"
          value={adress}
          onChangeText={setAdress}
        />

        <Text>Phone number</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Text>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <Text>Vehicle Type (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Type (Optional)"
          value={vehicleType}
          onChangeText={setVehicleType}
        />

        <Text>Plug Type (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Plug Type (Optional)"
          value={plugType}
          onChangeText={setPlugType}
        />
  
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
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
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      padding: 10,
      marginBottom: 10,
       color: "#000"
    },
    button: {
      backgroundColor: "#007bff",
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
  });
export default SignUp
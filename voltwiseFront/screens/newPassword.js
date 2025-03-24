import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native'; // For handling navigation and getting the token

const newPassword = () => {
  const route = useRoute(); // To get the token from the URL params
  const navigation = useNavigation(); // To navigate to the login page after password reset

  const { token } = route.params; // Extract token from route params
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (text) => setPassword(text);
  const handleConfirmPasswordChange = (text) => setConfirmPassword(text);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/auth/reset-password/${token}`,
        { password }
      );

      Alert.alert('Success', response.data.message);
      navigation.navigate('Login'); // Redirect to login screen
    } catch (err) {
      Alert.alert('Error', 'Failed to reset password, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        secureTextEntry
        value={password}
        onChangeText={handlePasswordChange}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
      />
      <Button
        title={loading ? 'Resetting...' : 'Reset Password'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
  },
});

export default newPassword;

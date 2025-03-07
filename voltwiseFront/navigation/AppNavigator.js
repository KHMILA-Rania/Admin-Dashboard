





import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../screens/Home';
import SignIn from '../screens/SignIn';
const Stack = createNativeStackNavigator();

export default function AppNavigator (){
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="Home" component={Home} />
            
          </Stack.Navigator>
        </NavigationContainer>
      );
}
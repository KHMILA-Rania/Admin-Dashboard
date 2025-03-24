

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../screens/Home';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import ResetPassword from '../screens/ResetPassword';
import UpdateProfile from '../screens/profileUser/UpdateProfile'
import SplashScreen from '../screens/SplashScreen';
const Stack = createNativeStackNavigator();


export default function AppNavigator (){
    return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SignIn" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name='SignUp' component={SignUp} />
          <Stack.Screen name='ResetPassword' component={ResetPassword} />
          <Stack.Screen name='UpdateProfile' component={UpdateProfile} />
          <Stack.Screen name="Splash" component={SplashScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      );
}
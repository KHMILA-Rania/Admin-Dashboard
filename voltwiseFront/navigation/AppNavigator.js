

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../screens/Home';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import ResetPassword from '../screens/ResetPassword';
import UpdateProfile from '../screens/user/UpdateProfile'
import SplashScreen from '../screens/SplashScreen';
import HomeUser from '../screens/user/HomeUser';
import AboutUs from '../screens/about';
import Complaint from '../screens/Complaint';
import CustomBottomBar from '../screens/user/customBottomBar';
import UserProfile from '../screens/user/userProfile';
import ComplaintsList from '../screens/user/ComplaintsList';
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
          <Stack.Screen name="HomeUser" component={HomeUser} />
          <Stack.Screen name="AboutUs" component={AboutUs} />
          <Stack.Screen name="Complaint" component={Complaint} />
          <Stack.Screen name="customBottomBar" component={CustomBottomBar} />
          <Stack.Screen name="userProfile" component={UserProfile} />
          <Stack.Screen name="ComplaintsList" component={ComplaintsList} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}
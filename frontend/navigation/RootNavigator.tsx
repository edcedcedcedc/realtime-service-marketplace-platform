import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import FancyLoadingScreen from "../screens/LoadingScreen";
import AuthScreen from "../screens/AuthScreen";
import JobsFeedScreen from "../screens/JobsFeedScreen";

export type RootStackParamList = {
  Login: undefined;
  Loading: undefined;
  Register: undefined;
  Home: undefined;
  Start: undefined;
  Jobsfeed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Start">
      {/*  <Stack.Screen name="Loading" component={FancyLoadingScreen} /> */}
      <Stack.Screen name="Start" component={AuthScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Jobsfeed" component={JobsFeedScreen} />
    </Stack.Navigator>
  );
}

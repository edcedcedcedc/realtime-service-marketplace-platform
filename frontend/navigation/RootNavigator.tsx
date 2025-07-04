import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../screens/AuthScreen";
import JobFeedScreen from "../screens/JobFeedScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import JobPostScreen from "../screens/JobPostScreen";
import HeaderMenu from "../screens/HeaderMenu";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

export type RootStackParamList = {
  Login: undefined;
  Loading: undefined;
  Register: undefined;
  Start: undefined;
  "Task feed": undefined;
  "Task details": undefined;
  "Search a tasker": undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={({ navigation }) => ({
        headerRight: () => <HeaderMenu navigation={navigation} />,
      })}
    >
      <Stack.Screen name="Start" component={AuthScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Task feed" component={JobFeedScreen} />
      <Stack.Screen name="Task details" component={JobDetailsScreen} />
      <Stack.Screen name="Search a tasker" component={JobPostScreen} />
    </Stack.Navigator>
  );
}

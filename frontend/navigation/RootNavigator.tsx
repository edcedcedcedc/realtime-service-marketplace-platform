import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../screens/AuthScreen";
import JobsFeedScreen from "../screens/JobsFeedScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import JobPostScreen from "../screens/JobPostScreen";

export type RootStackParamList = {
  Login: undefined;
  Loading: undefined;
  Register: undefined;
  Client: undefined;
  Start: undefined;
  Jobsfeed: undefined;
  JobDetails: undefined;
  JobPost: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Start">
      <Stack.Screen name="Start" component={AuthScreen} />
      <Stack.Screen name="Jobsfeed" component={JobsFeedScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="JobPost" component={JobPostScreen} />
    </Stack.Navigator>
  );
}

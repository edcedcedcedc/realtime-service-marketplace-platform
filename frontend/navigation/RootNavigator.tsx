import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthScreen from "../screens/AuthScreen";
import JobFeedScreen from "../screens/JobFeedScreen";
import JobDetailsScreen from "../screens/JobDetailsScreen";
import JobPostScreen from "../screens/JobPostScreen";

export type RootStackParamList = {
  Login: undefined;
  Loading: undefined;
  Register: undefined;
  Start: undefined;
  JobFeed: undefined;
  JobDetails: undefined;
  JobPost: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Start">
      <Stack.Screen name="Start" component={AuthScreen} />
      <Stack.Screen name="JobFeed" component={JobFeedScreen} />
      <Stack.Screen name="JobDetails" component={JobDetailsScreen} />
      <Stack.Screen name="JobPost" component={JobPostScreen} />
    </Stack.Navigator>
  );
}

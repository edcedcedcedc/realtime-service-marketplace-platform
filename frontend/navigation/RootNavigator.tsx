import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Auth from "../screens/Auth";
import TaskFeed from "../screens/TaskFeed";
import TaskDetails from "../screens/TaskDetails";
import TaskPost from "../screens/TaskPost";
import HeaderMenu from "../screens/HeaderMenu";
import Login from "../screens/Login";
import Register from "../screens/Register";

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
      <Stack.Screen name="Start" component={Auth} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Task feed" component={TaskFeed} />
      <Stack.Screen name="Task details" component={TaskDetails} />
      <Stack.Screen name="Search a tasker" component={TaskPost} />
    </Stack.Navigator>
  );
}

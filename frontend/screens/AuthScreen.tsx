// navigation/AuthTabs.tsx
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Tab = createMaterialTopTabNavigator();

export default function AuthTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { height: 2 },
        tabBarLabelStyle: { display: "none" },
        tabBarIndicatorStyle: { backgroundColor: "#007AFF" },
        swipeEnabled: true,
      }}
    >
      <Tab.Screen name="Login" component={LoginScreen} />
      <Tab.Screen name="Register" component={RegisterScreen} />
    </Tab.Navigator>
  );
}

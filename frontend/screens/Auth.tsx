// navigation/AuthTabs.tsx
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Login from "./Login";
import Register from "./Register";

const Tab = createMaterialTopTabNavigator();

export default function AuthTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { height: 2 },
        tabBarLabelStyle: { display: "none" },
        tabBarIndicatorStyle: {
          backgroundColor: route.name === "Login" ? "#007AFF" : "#FF6F00",
        },
        swipeEnabled: true,
      })}
    >
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Register" component={Register} />
    </Tab.Navigator>
  );
}

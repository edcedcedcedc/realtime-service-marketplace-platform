import React, { useEffect } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { COLORS } from "../constants/colors";

import Login from "./Login";
import Register from "./Register";
import useStore from "../store/useStore";

const Tab = createMaterialTopTabNavigator();

export default function AuthTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { height: 2 },
        tabBarLabelStyle: { display: "none" },
        tabBarIndicatorStyle: {
          backgroundColor:
            route.name === "Login" ? COLORS.color23 : COLORS.color24,
        },
        swipeEnabled: true,
      })}
    >
      <Tab.Screen name="Login" component={Login} />
      <Tab.Screen name="Register" component={Register} />
    </Tab.Navigator>
  );
}

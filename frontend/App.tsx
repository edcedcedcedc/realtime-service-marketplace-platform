import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import Toast from "react-native-toast-message";
import ToastConfig from "./config/ToastConfig";

export default function App() {
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast config={ToastConfig} visibilityTime={1000} />
    </>
  );
}

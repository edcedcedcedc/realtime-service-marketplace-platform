import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import Toast from "react-native-toast-message";
import ToastConfig from "./config/ToastConfig";
import useStore from "./store/useStore";
import GlobalLoading from "./screens/GlobalLoading";

export default function App() {
  const loading = useStore((state) => state.loading);
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast config={ToastConfig} visibilityTime={2000} />
      <GlobalLoading visible={loading} />
    </>
  );
}

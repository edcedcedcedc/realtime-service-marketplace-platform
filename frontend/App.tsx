import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import Toast from "react-native-toast-message";
import ToastConfig from "./config/ToastConfig";
import useStore, { Job } from "./store/useStore";
import GlobalLoading from "./screens/GlobalLoading";
import { closeSocket, startSocket } from "./utils/sockets";

export default function App() {
  console.log("test");
  useEffect(() => {
    startSocket((newJob: Job) => {
      Toast.show({
        type: "success",
        text1: "New task received",
      });
      console.log("New job received", newJob);
      useStore.getState().addJob(newJob); // update Zustand store with the new job
    });

    return () => {
      closeSocket();
    };
  }, []);

  const loading = useStore((state) => state.loading);
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <Toast config={ToastConfig} visibilityTime={2500} />
      <GlobalLoading visible={loading} />
    </>
  );
}

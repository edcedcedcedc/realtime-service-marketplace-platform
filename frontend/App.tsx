import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import Toast from "react-native-toast-message";
import ToastConfig from "./config/ToastConfig";
import useStore, { Job } from "./store/useStore";
import GlobalLoading from "./screens/GlobalLoading";
import { closeSocket, startSocket } from "./utils/sockets";
import { socketManager } from "./utils/socketManager";
import { WS_URL } from "./services/api";

export default function App() {
  const addJob = useStore((state) => state.addJob);
  const logged = useStore((state) => Boolean(state.auth.jwt?.access));
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    /*   if (!logged) {
      socketManager.disconnect();
      return;
    }
  */
    socketManager.connect(WS_URL);

    const handleNewJob = (newJob: Job) => {
      Toast.show({
        type: "success",
        text1: "New task received",
      });

      addJob(newJob);
    };

    const handleSocketOnOpen = () =>
      Toast.show({
        type: "success",
        text1: "Websocket connected!",
      });

    socketManager.on("job:new", handleNewJob);
    socketManager.on("socket:onopen", handleSocketOnOpen);

    return () => {
      socketManager.off("job:new", handleNewJob);
      socketManager.disconnect();
    };
  }, [logged, addJob]);

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

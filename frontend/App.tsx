import React, { useEffect } from "react";

import Toast from "react-native-toast-message";
import useStore, { Job } from "./store/useStore";
import { socketManager } from "./utils/socketManager";
import { WS_URL } from "./services/api";
import WrappedRootNavigator from "./navigation/WrapperRootNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./utils/navigationRef";

export default function App() {
  const addJob = useStore((state) => state.addJob);
  useEffect(() => {
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
  }, [addJob]);

  return (
    <NavigationContainer ref={navigationRef}>
      <WrappedRootNavigator />
    </NavigationContainer>
  );
}

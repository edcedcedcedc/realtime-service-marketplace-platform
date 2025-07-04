import React, { useEffect } from "react";

import Toast from "react-native-toast-message";
import useStore, { Job } from "./store/useStore";
import { socketManager } from "./utils/socketManager";
import { WS_URL } from "./services/api";
import WrappedRootNavigator from "./navigation/WrapperRootNavigator";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./utils/navigationRef";

export default function App() {
  useEffect(() => {
    socketManager.connect(WS_URL);
    const handleNewJob = (payload: Job) => {
      Toast.show({
        type: "info",
        text1: "New task received",
      });
      useStore.getState().addJob(payload);
    };

    type Id = { id: number };

    const handleDeleteJob = (id: Id) => {
      Toast.show({
        type: "info",
        text1: `Job with ${JSON.stringify(id)} was deleted`,
      });
      useStore.getState().removeJob(id.id);
    };

    const handleSocketOnOpen = () =>
      Toast.show({
        type: "success",
        text1: "Websocket connected!",
      });

    socketManager.on("job:new", handleNewJob);
    socketManager.on("job:delete", handleDeleteJob);
    socketManager.on("socket:onopen", handleSocketOnOpen);

    return () => {
      socketManager.off("job:new", handleNewJob);
      socketManager.off("socket:onopen", handleSocketOnOpen);
      socketManager.disconnect();
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <WrappedRootNavigator />
    </NavigationContainer>
  );
}

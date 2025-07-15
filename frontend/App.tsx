import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";
import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
  EdgeInsets,
} from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import RootNavigator from "./navigation/RootNavigator";
import AppLayout from "./components/AppLayout";
import useStore, { Task } from "./store/useStore";
import { SocketManager } from "./utils/socketManager";
import { navigationRef } from "./utils/navigationRef";

import { COLORS } from "./constants/colors";
import { WS_TASKFEED_URL } from "./constants/network";

export default function App() {
  const taskFeedSocket = new SocketManager();
  const addTask = useStore.getState().addTask;
  const removeTask = useStore.getState().removeTask;
  const user = useStore((state) => state.auth.user);

  useEffect(() => {
    if (user?.role != "tasker") {
      return;
    }
    taskFeedSocket.connect(WS_TASKFEED_URL, "task feed");

    const handleNewTask = (payload: Task) => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: `New task received, id:  ${payload.id}`,
          text2: "Task feed",
        });
      }, 3000);
      addTask(payload);
    };

    const handleDeleteTask = (id: { id: number }) => {
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: `Task with id ${id.id} was deleted`,
          text2: "Task feed",
        });
      }, 100);
      console.log(id.id, "payload id");
      removeTask(id.id);
    };

    const handleSocketOnOpen = () =>
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Websocket connected!",
          text2: "Task feed",
        });
      }, 8000);

    taskFeedSocket.on("task:new", handleNewTask);
    taskFeedSocket.on("task:delete", handleDeleteTask);
    taskFeedSocket.on("socket:onopen", handleSocketOnOpen);

    return () => {
      taskFeedSocket.off("task:new", handleNewTask);
      taskFeedSocket.off("socket:onopen", handleSocketOnOpen);
      taskFeedSocket.disconnect();
    };
  }, [user]);

  // Predefined fake insets for devices
  const fakeInsetsForDevices: Record<string, EdgeInsets> = {
    "iPhone 13 Mini": { top: 47, bottom: 34, left: 0, right: 0 },
    "iPhone 14 Pro": { top: 59, bottom: 34, left: 0, right: 0 },
    "iPhone SE (2nd gen)": { top: 20, bottom: 0, left: 0, right: 0 },
    "iPhone 11": { top: 48, bottom: 34, left: 0, right: 0 },
    "iPhone 12 Pro Max": { top: 59, bottom: 34, left: 0, right: 0 },
    "iPhone XR": { top: 48, bottom: 34, left: 0, right: 0 },
    "iPhone X": { top: 44, bottom: 34, left: 0, right: 0 },
    'iPad Pro 11"': { top: 24, bottom: 20, left: 20, right: 20 },
    "iPad Air (4th gen)": { top: 24, bottom: 20, left: 20, right: 20 },
    "Samsung Galaxy S21": { top: 24, bottom: 0, left: 0, right: 0 },
    "Google Pixel 6": { top: 24, bottom: 0, left: 0, right: 0 },
    "OnePlus 9": { top: 24, bottom: 0, left: 0, right: 0 },
    "Redmi Note 11": { top: 24, bottom: 0, left: 0, right: 0 },
    "Android (No notch)": { top: 24, bottom: 0, left: 0, right: 0 },
  };

  const [selectedDevice, setSelectedDevice] = useState("Android (No notch)");
  const insets = fakeInsetsForDevices[selectedDevice];

  return (
    <SafeAreaProvider>
      {/*  <SafeAreaInsetsContext.Provider value={insets}> */}
      {/* <View style={styles.deviceSelector}>
          <Text style={styles.title}>Simulate Safe Area for:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(fakeInsetsForDevices).map((device) => (
              <Button
                key={device}
                title={device}
                onPress={() => setSelectedDevice(device)}
                color={device === selectedDevice ? COLORS.color23 : undefined}
              />
            ))}
          </ScrollView>
        </View> */}

      <PaperProvider>
        <NavigationContainer ref={navigationRef}>
          <AppLayout>
            <RootNavigator />
          </AppLayout>
        </NavigationContainer>
      </PaperProvider>
      {/* </SafeAreaInsetsContext.Provider> */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  deviceSelector: {
    backgroundColor: COLORS.color17,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});

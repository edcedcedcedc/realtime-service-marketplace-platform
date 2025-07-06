import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import Toast from "react-native-toast-message";
import useStore, { Job } from "./store/useStore";
import { socketManager } from "./utils/socketManager";
import { WS_URL } from "./services/api";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef } from "./utils/navigationRef";
import AppLayout from "./AppLayout";
import { PaperProvider } from "react-native-paper";
import RootNavigator from "./navigation/RootNavigator";
import {
  SafeAreaProvider,
  SafeAreaInsetsContext,
  EdgeInsets,
} from "react-native-safe-area-context";

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
  Toast.show({
    type: "info",
    text1: `the selected device is ${selectedDevice}`,
  });
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
                color={device === selectedDevice ? "#007AFF" : undefined}
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
    padding: 10,
    backgroundColor: "#f2f2f2",
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
});

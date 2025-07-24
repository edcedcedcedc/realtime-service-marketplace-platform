import { StyleSheet, View } from "react-native";
import { PaperProvider, Text, Chip, Snackbar } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import RootNavigator from "./navigation/RootNavigator";
import AppLayout from "./components/AppLayout";
import { navigationRef } from "./utils/navigationRef";
import { COLORS } from "./constants/colors";
import { AlertsProvider } from "react-native-paper-alerts";
import useStore from "./store/useStore";
import { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";

export default function App() {
  const setIsConnected = useStore((state) => state.setIsConnected);
  const isConnected = useStore((state) => state.isConnected);
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  /* const snackbarVisible = useStore((state) => state.snackbarVisible);
  const setSnackbarVisible = useStore().setSnackbarVisible;
  const [snackbarMessage, setSnackbarMessage] = useState(""); */

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      /*  setSnackbarMessage(connected ? "You are online" : "You are offline");
      setSnackbarVisible(true) */ console.log(
        `[App.tsx] NetInfo changed: ${connected}`
      );
    });

    return () => unsubscribe();
  }, [setIsConnected, isLoggedIn]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AlertsProvider>
          <NavigationContainer ref={navigationRef}>
            <AppLayout>
              {/* Material Chip Status Bar */}
              {/* <View style={styles.statusBar}>
                <Text
                  style={{
                    color: isConnected ? COLORS.color3 : COLORS.color7,
                    fontWeight: "bold",
                  }}
                >
                  {isConnected ? "Online" : "Offline"}
                </Text>
              </View> */}

              <RootNavigator />

              {/*  {isLoggedIn && (
                <Snackbar
                  visible={snackbarVisible}
                  onDismiss={() => setSnackbarVisible(false)}
                  duration={3000}
                  style={{
                    backgroundColor: isConnected ? "#388E3C" : "#D32F2F",
                  }}
                >
                  {snackbarMessage}
                </Snackbar>
              )} */}
            </AppLayout>
          </NavigationContainer>
        </AlertsProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  statusBar: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1000,
    elevation: 3,
  },
  deviceSelector: {
    backgroundColor: COLORS.color17,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});

import { StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/RootNavigator";
import AppLayout from "./components/AppLayout";
import { navigationRef } from "./utils/navigationRef";
import { COLORS } from "./constants/colors";
import { AlertsProvider } from "react-native-paper-alerts";
import useStore from "./store/useStore";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useEffect } from "react";

export default function App() {
  useOnlineStatus();
  const isOnline = useStore((s) => s.isOnline);
  useEffect(() => {
    console.log("🌐 Online Status:", isOnline);
  }, [isOnline]);
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

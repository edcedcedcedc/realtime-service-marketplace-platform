import { StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";

import RootNavigator from "./navigation/RootNavigator";
import AppLayout from "./components/AppLayout";
import { navigationRef } from "./utils/navigationRef";

import { COLORS } from "./constants/colors";
import { AlertsProvider } from "react-native-paper-alerts";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AlertsProvider>
          <NavigationContainer ref={navigationRef}>
            <AppLayout>
              <RootNavigator />
            </AppLayout>
          </NavigationContainer>
        </AlertsProvider>
      </PaperProvider>
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

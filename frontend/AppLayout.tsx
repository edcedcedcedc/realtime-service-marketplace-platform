// AppLayout.tsx
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from "react-native";
import useStore from "./store/useStore";
import Toast from "react-native-toast-message";
import GlobalLoading from "./utils/GlobalLoading";
import ToastConfig from "./config/ToastConfig";
import { SPACING } from "./utils/spacings";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const loading = useStore((state) => state.loading);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {children}
        <Toast config={ToastConfig} visibilityTime={4000} />
        <GlobalLoading visible={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: SPACING.md,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: SPACING.sm,
  },
});

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
import GlobalLoading from "./screens/GlobalLoading";
import ToastConfig from "./config/ToastConfig";
import { SPACING } from "./utils/spacings";
import { useWindowDimensions } from "react-native";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const loading = useStore((state) => state.loading);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {children}
        <Toast config={ToastConfig} visibilityTime={2500} />
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

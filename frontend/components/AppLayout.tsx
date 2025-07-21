// AppLayout.tsx
import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
  StatusBar,
} from "react-native";
import Toast from "react-native-toast-message";

import GlobalLoading from "./GlobalLoading";
import ToastConfig from "../config/ToastConfig";
import useStore from "../store/useStore";
import { SPACING } from "../constants/dimensions";
import { COLORS } from "../constants/colors";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const loading = useStore((state) => state.loading);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {children}
        <Toast config={ToastConfig} visibilityTime={2000} />
        <GlobalLoading visible={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingVertical: SPACING.sm,
  },
  safeArea: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});

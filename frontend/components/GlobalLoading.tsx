import React from "react";
import { View, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { useTheme } from "react-native-paper";

import { COLORS } from "../constants/colors";

export default function GlobalLoading({ visible }: { visible: boolean }) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: COLORS.color37 }]}>
        <View
        /* style={[
            styles.spinnerContainer,
            { backgroundColor: theme.colors.surface },
          ]} */
        >
          <ActivityIndicator size="large" color={COLORS.color16} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.color36, // semi-transparent dark background
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1100,
    elevation: 1100, // Android
  },
  spinnerContainer: {
    backgroundColor: COLORS.color20,
    borderRadius: 12,
    elevation: 6,
    padding: 24,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

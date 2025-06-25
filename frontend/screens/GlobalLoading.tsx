// components/GlobalLoading.tsx
import React from "react";
import { View, StyleSheet, ActivityIndicator, Modal } from "react-native";
import { useTheme } from "react-native-paper";

export default function GlobalLoading({ visible }: { visible: boolean }) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
        <View
          style={[
            styles.spinnerContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ActivityIndicator size="large" color="#2962FF" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#303F9F",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

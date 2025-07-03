import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ToastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.container, styles.success]}>
      <Text style={styles.text1}>{text1}</Text>
      {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View style={[styles.container, styles.error]}>
      <Text style={styles.text1}>{text1}</Text>
      {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View style={[styles.container, styles.info]}>
      <Text style={styles.text1}>{text1}</Text>
      {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 40,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 24,
    elevation: 6, // material shadow
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: "column",
    justifyContent: "center",
  },
  Layout: {
    zIndex: 1000,
    elevation: 1000,
  },
  success: {
    backgroundColor: "#388E3C", // Material Green 700
  },
  error: {
    backgroundColor: "#D32F2F", // Material Red 700
  },
  info: {
    backgroundColor: "#1976D2", // Material Blue 700
  },
  text1: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  text2: {
    fontSize: 14,
    color: "rgba(255,255,255,0.87)", // slightly transparent white per Material spec
    marginTop: 4,
  },
});

export default ToastConfig;

import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../constants/colors";

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
  Layout: {
    elevation: 1000,
    zIndex: 1,
  },
  container: {
    borderRadius: 4,
    elevation: 6, // material shadow
    flexDirection: "column",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 40,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
  error: {
    backgroundColor: COLORS.color5, // Material Red 700
  },
  info: {
    backgroundColor: COLORS.color1, // Material Blue 700
  },
  success: {
    backgroundColor: COLORS.color3, // Material Green 700
  },
  text1: {
    color: COLORS.color19,
    fontSize: 16,
    fontWeight: "500",
  },
  text2: {
    color: COLORS.color38, // slightly transparent white per Material spec
    fontSize: 14,
    marginTop: 4,
  },
});

export default ToastConfig;

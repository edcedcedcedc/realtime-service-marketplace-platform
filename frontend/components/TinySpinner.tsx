import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";

import { COLORS } from "../constants/colors";

const TinySpinner = ({ message = "Loading…" }: { message?: string }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: COLORS.color15,
    fontSize: 13,
    marginLeft: 8,
  },
  spinner: {
    borderColor: COLORS.color16,
    borderRadius: 6,
    borderTopColor: "transparent",
    borderWidth: 2,
    height: 12,
    width: 12,
  },
});

export default TinySpinner;

import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Button,
} from "react-native";

interface FancyLoadingScreenProps {
  route?: any;
  navigation: any;
}

export default function FancyLoadingScreen({
  navigation,
  route,
}: FancyLoadingScreenProps): React.JSX.Element {
  const message = route?.params?.message || "Please wait...";
  useEffect(() => {
    console.log("Loading Mounted");
    return () => {
      console.log("Loading Unmounted");
    };
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.logoPlaceholder}>
        <>
          <Text style={styles.logoText}>[Your Logo Here]</Text>
          <Button title="Login" onPress={() => navigation.replace("Login")} />
        </>
      </View>

      <ActivityIndicator size="large" color="#007AFF" style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    color: "#888",
    fontSize: 18,
    fontWeight: "bold",
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

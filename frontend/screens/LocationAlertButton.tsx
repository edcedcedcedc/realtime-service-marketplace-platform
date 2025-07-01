import React from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";

type Props = {
  onLocationFetched: (coords: { latitude: number; longitude: number }) => void;
};

export default function LocationAlertButton({ onLocationFetched }: Props) {
  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to fetch your position."
      );
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    onLocationFetched({ latitude, longitude });
  };

  return (
    <View style={styles.wrapper}>
      <Button title="Use My Location" onPress={handleGetLocation} />
      <Text style={styles.helperText}>
        You choose your location manually if you don't prefer exact location,
        just dont tap 'Use My Location'
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
  },
});

import React, { useState } from "react";
import { View, Button, Alert, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";

export default function LocationAlertButton({
  onLocationFetched,
}: {
  onLocationFetched: any;
}) {
  const handlePress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Cannot get your location without permission."
      );
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    onLocationFetched(location.coords);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <Button title="Use My Location" onPress={handlePress} />
      </View>
      <Text style={styles.infoText}>
        You can also manually enter a location or select a nearby point on the
        map if you prefer not to share your exact location.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  infoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  buttonWrapper: {
    width: 200, // control the button width here
  },
});

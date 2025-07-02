import React from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import * as Location from "expo-location";
import useStore, { DEFAULT_DELTA } from "../store/useStore";
import { Region } from "react-native-maps";

type Props = {
  onLocationFetched: (region: Region) => void;
};

export default function MyLocationScreen({ onLocationFetched }: Props) {
  const setSelectedRegion = useStore((s) => s.setSelectedRegion);
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

    onLocationFetched({ latitude, longitude, ...DEFAULT_DELTA });
    setSelectedRegion({
      latitude,
      longitude,
      ...DEFAULT_DELTA,
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={{ display: "flex", alignItems: "center" }}>
        <View
          style={{
            width: 200,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button title="Use My Location" onPress={handleGetLocation} />
        </View>
      </View>
      <Text style={styles.helperText}>
        You can choose your location manually if you don't prefer exact
        location, just double tap the mini map.
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import useStore from "../store/useStore";

type LatLng = {
  latitude: number;
  longitude: number;
};

type Props = {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onClose: () => void;
};

export default function FullMapScreen({ initialRegion, onClose }: Props) {
  const selectedRegion = useStore((state) => state.selectedRegion);
  const setSelectedRegion = useStore((state) => state.setSelectedRegion);
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    // Keep local selectedLocation in sync with global selectedRegion
    setSelectedLocation(selectedRegion);
  }, [selectedRegion]);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setSelectedRegion({
      ...coordinate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {selectedRegion && (
          <Marker coordinate={selectedRegion} title="Selected Location" />
        )}
      </MapView>

      {/* Single Exit button top right */}
      <TouchableOpacity onPress={onClose} style={styles.exitButton}>
        <Text style={styles.buttonText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  exitButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#2962FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    zIndex: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

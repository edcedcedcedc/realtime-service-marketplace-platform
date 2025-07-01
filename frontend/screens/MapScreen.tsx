import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

type Props = {
  address: string;
  onDoubleTap?: () => void;
};

type LatLng = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function MapScreen({ address, onDoubleTap }: Props) {
  const [region, setRegion] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const lastTap = useRef<number>(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      console.log("🫰 Double tap detected");
      onDoubleTap?.();
    }
    lastTap.current = now;
  };

  useEffect(() => {
    if (!address) {
      setRegion(null);
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      try {
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded.length > 0 && active) {
          const { latitude, longitude } = geocoded[0];
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else if (active) {
          setRegion(null);
        }
      } catch {
        if (active) setRegion(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [address]);

  if (!address) {
    return (
      <Text style={styles.infoText}>Enter a location to preview the map</Text>
    );
  }

  if (loading) {
    return <Text style={styles.infoText}>Loading map preview...</Text>;
  }

  if (!region) {
    return <Text style={styles.infoText}>Invalid location</Text>;
  }

  return (
    <View style={styles.mapWrapper}>
      <MapView
        style={styles.map}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        pointerEvents="none"
      >
        <Marker coordinate={region} title="Selected Location" />
      </MapView>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleDoubleTap}
        android_ripple={{ color: "transparent" }}
      >
        {/* invisible but pressable layer */}
        <View />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrapper: {
    position: "relative",
    width: "100%",
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
});

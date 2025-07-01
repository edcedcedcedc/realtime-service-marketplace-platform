import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import useStore from "../store/useStore";

type Props = {
  address: string;
  onDoubleTap?: () => void;
};

export default function MiniMapScreen({ address, onDoubleTap }: Props) {
  const selectedRegion = useStore((state) => state.selectedRegion);
  const [mapReady, setMapReady] = useState(false);
  const setSelectedRegion = useStore((state) => state.setSelectedRegion);
  const setMarkerPoint = useStore((state) => state.setMarkerPoint);
  const markerPoint = useStore((state) => state.markerPoint);
  const [loading, setLoading] = useState(false);
  const lastTap = useRef<number>(0);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current || !selectedRegion || !mapReady) return;

    mapRef.current
      .pointForCoordinate(selectedRegion)
      .then((point) => {
        setMarkerPoint(point);
      })
      .catch((error) => {
        console.warn("Failed to get point for coordinate:", error);
      });
  }, [selectedRegion, mapReady]);

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
      setSelectedRegion(null);
      return;
    }

    let active = true;

    (async () => {
      setLoading(true);
      try {
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded.length > 0 && active) {
          const { latitude, longitude } = geocoded[0];
          setSelectedRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else if (active) {
          setSelectedRegion(null);
        }
      } catch {
        if (active) setSelectedRegion(null);
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

  if (!selectedRegion) {
    return <Text style={styles.infoText}>Invalid location</Text>;
  }

  return (
    <View style={styles.mapWrapper}>
      <MapView
        ref={mapRef}
        onMapReady={() => setMapReady(true)}
        style={styles.map}
        region={selectedRegion}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        pointerEvents="none"
      >
        <Marker coordinate={selectedRegion} title="Selected Location" />
      </MapView>

      {/* Dot overlay on marker coordinate */}
      {markerPoint && (
        <View
          style={[
            styles.dot,
            {
              left: markerPoint.x - 6,
              top: markerPoint.y - 26, // shifted up by ~20px more than before
            },
          ]}
        />
      )}

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
  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "red",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 10,
  },
});

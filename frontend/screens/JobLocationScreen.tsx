import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

type Props = {
  address: string;
};

type LatLng = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function JobLocationScreen({ address }: Props) {
  const [region, setRegion] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

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
      } catch (e) {
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
    <MapView
      style={styles.map}
      region={region}
      scrollEnabled={false}
      zoomEnabled={false}
    >
      <Marker coordinate={region} title="Selected Location" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
});

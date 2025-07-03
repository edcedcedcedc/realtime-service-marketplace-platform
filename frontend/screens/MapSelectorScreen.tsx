import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import useStore, { Region } from "../store/useStore";
import AnimatedCircle from "../utils/AnimatedCircle";
import { DEFAULT_DELTA } from "../store/useStore";
import TinySpinner from "../utils/TinySpinner";
type Props = {
  address: string;
  isSearching: boolean;
  onDoubleTap?: () => void;
  onExit: (region: Region) => void;
  onChange: () => void;
  handleGetLocation: (region: Region) => void;
};

export default function MapSelectorScreen({
  address,
  isSearching,
  onExit,
  onChange,
  handleGetLocation,
}: Props) {
  const miniMapReady = useStore((s) => s.miniMapReady);
  const fullMapReady = useStore((s) => s.fullMapReady);
  const isFullMapVisible = useStore((s) => s.isFullMapVisible);
  const setMiniMapReady = useStore((s) => s.setMiniMapReady);
  const setFullMapReady = useStore((s) => s.setFullMapReady);
  const setIsFullMapVisible = useStore((s) => s.setIsFullMapVisible);
  const selectedRegion = useStore((s) => s.selectedRegion);
  const setSelectedRegion = useStore((s) => s.setSelectedRegion);
  const miniMapRef = useRef<MapView | null>(null);
  const fullMapRef = useRef<MapView | null>(null);

  const [markerPointMini, setMarkerPointMini] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [markerPointFull, setMarkerPointFull] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const lastTap = useRef<number>(0);
  const [loading, setLoading] = useState(false);

  const handleMapPress = (event: any) => {
    if (isSearching) {
      return;
    }
    const { coordinate } = event.nativeEvent;
    setSelectedRegion({
      ...coordinate,
      ...DEFAULT_DELTA,
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      setIsFullMapVisible(true);
      console.log("Current state:", {
        fullMapReady,
        selectedRegion,
        isFullMapVisible,
      });
    }
    lastTap.current = now;
  };

  /*   const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }; */

  /* const updatePosition = useRef(
    debounce(async () => {
      if (!fullMapRef.current || !selectedRegion) return;
      try {
        const point =
          await fullMapRef.current.pointForCoordinate(selectedRegion);
        setMarkerPointFull(point);
      } catch {
        setMarkerPointFull(lastValidPositionRef.current);
      }
    }, 16)
  ).current; */

  useEffect(() => {
    if (
      isFullMapVisible &&
      fullMapRef.current &&
      selectedRegion &&
      fullMapReady
    ) {
      const calculatePoint = async () => {
        try {
          const point =
            await fullMapRef.current?.pointForCoordinate(selectedRegion);
          if (point) {
            setMarkerPointFull(point);
          }
        } catch (err) {
          console.warn("Point calculation failed, retrying...", err);
          setTimeout(() => {
            if (fullMapRef.current) {
              fullMapRef.current
                .pointForCoordinate(selectedRegion)
                .then(setMarkerPointFull)
                .catch(console.warn);
            }
          }, 300);
        }
      };
      calculatePoint();
    }
  }, [isFullMapVisible, handleDoubleTap, selectedRegion]);

  useEffect(() => {
    console.log("render");
    if (!isFullMapVisible && miniMapRef.current && selectedRegion) {
      const calculatePoint = async () => {
        try {
          const point =
            await miniMapRef.current?.pointForCoordinate(selectedRegion);
          if (point) setMarkerPointMini(point);
        } catch (err) {
          console.warn("Point calculation failed, retrying...", err);
          setTimeout(() => {
            if (miniMapRef.current) {
              miniMapRef.current
                .pointForCoordinate(selectedRegion)
                .then(setMarkerPointMini)
                .catch(console.warn);
            }
          }, 300);
        }
      };
      calculatePoint();
    }
  }, [isFullMapVisible, onChange, selectedRegion]);

  // Geocode text input
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
            ...DEFAULT_DELTA,
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
    return <TinySpinner message="Loading map preview…" />;
  }

  if (!selectedRegion) {
    return <Text style={styles.infoText}>Invalid location</Text>;
  }

  const handleExit = () => {
    setIsFullMapVisible(false);
    if (isSearching) return;
    onExit(selectedRegion);
  };

  return (
    <>
      {/* MiniMap */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={miniMapRef}
          onMapReady={() => setMiniMapReady(true)}
          style={styles.mapMini}
          region={selectedRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          pointerEvents="none"
        >
          <Marker coordinate={selectedRegion} title="Selected Location" />
        </MapView>

        {isSearching && markerPointMini && miniMapReady && (
          <AnimatedCircle x={markerPointMini.x} y={markerPointMini.y} />
        )}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleDoubleTap}
          android_ripple={{ color: "transparent" }}
        >
          <View />
        </Pressable>
      </View>

      {/* FullMap Modal */}
      <Modal visible={isFullMapVisible} animationType="slide">
        <View style={styles.fullContainer}>
          <MapView
            ref={fullMapRef}
            initialRegion={selectedRegion}
            style={styles.mapFull}
            onMapReady={() => setFullMapReady(true)}
            /*  onRegionChange={updatePosition}
            onRegionChangeComplete={updatePosition} */
            onPress={handleMapPress}
            zoomEnabled={false}
            scrollEnabled={true}
          >
            {selectedRegion && (
              <Marker coordinate={selectedRegion} title="Selected Location" />
            )}
          </MapView>

          {isSearching && markerPointFull && (
            <AnimatedCircle x={markerPointFull.x} y={markerPointFull.y} />
          )}

          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.buttonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
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
  mapMini: {
    width: "100%",
    height: "100%",
  },
  fullContainer: {
    flex: 1,
  },
  mapFull: {
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
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 59, 48, 0.4)",
    zIndex: 5,
    pointerEvents: "none",
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

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore, { Region } from "../store/useStore";
import { SPACING } from "../utils/spacings";
import MiniMapScreen from "./MiniMapScreen";
import MyLocationScreen from "./MyLocationScreen";
import FullMapScreen from "./FullMapScreen";

const urgencyOptions = [
  { label: "Now", value: "now", color: "#ff3b30" },
  { label: "Soon", value: "soon", color: "#ff9500" },
  { label: "Flexible", value: "flexible", color: "#34c759" },
];

const defaultRegion: Region = {
  latitude: 37.78825, // default latitude (e.g., San Francisco)
  longitude: -122.4324, // default longitude
  latitudeDelta: 0.01, // zoom level (adjust as needed)
  longitudeDelta: 0.01, // zoom level
};

export default function JobPostScreen({ navigation }: any) {
  const setTempJobData = useStore((state) => state.setTempJobData);
  const setSelectedRegion = useStore((state) => state.setSelectedRegion);
  const selectedRegion = useStore((state) => state.selectedRegion);
  const [isFullMapVisible, setIsFullMapVisible] = useState(false);
  const [address, setAddress] = useState("Chisinau");
  const setLoading = useStore((state) => state.setLoading);
  const [isSearching, setIsSearching] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  let timeout: any = null;
  const { control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      location: "",
      urgency: "now",
    },
  });
  const location = watch("location");

  useEffect(() => {
    return () => {
      clearTimeout(timeout);
      setLoading(false);
      reset();
    };
  }, []);

  const urgency = watch("urgency");

  const onSubmit = (data: any) => {
    setIsSearching(true);
    setTempJobData(data);
    setIsSearching(true);
  };

  const cancelSearch = () => {
    setIsSearching(false);
    pulseAnim.stopAnimation();
  };

  const logout = () => {
    setLoading(true);
    timeout = setTimeout(() => navigation.replace("Start"), 10);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        extraHeight={250}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text style={styles.heading}>What do you need?</Text>

            {/* Fields */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Task title (be short and concrete)"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Description"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />

            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Budget"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                />
              )}
            />

            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    style={styles.input}
                    placeholder="Location"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                  />
                  <View>
                    <MyLocationScreen
                      onLocationFetched={(coords: any) => {
                        const locationString = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
                        onChange(locationString);
                        setSelectedRegion({
                          latitude: coords.latitude,
                          longitude: coords.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        });
                      }}
                    />
                    <MiniMapScreen
                      address={value || ""}
                      onDoubleTap={() => setIsFullMapVisible(true)}
                      isSearching={isSearching}
                    />
                    <Modal visible={isFullMapVisible} animationType="slide">
                      <FullMapScreen
                        initialRegion={selectedRegion ?? defaultRegion}
                        onClose={() => setIsFullMapVisible(false)}
                      />
                    </Modal>
                  </View>
                </View>
              )}
            />

            <Text style={styles.label}>Urgency</Text>
            <View style={styles.urgencyContainer}>
              {urgencyOptions.map(({ label, value, color }) => {
                const selected = urgency === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={styles.urgencyButton}
                    onPress={() => setValue("urgency", value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        selected
                          ? { color: color, fontWeight: "600" }
                          : { color: "#888" },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!isSearching ? (
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                style={styles.searchButtonFind}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Find</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={cancelSearch}
                style={styles.searchButtonStop}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Stop</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={logout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingVertical: SPACING.md,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    color: "#212121",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#212121",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  descriptionInput: {
    height: 110,
    paddingTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
    color: "#666",
  },
  urgencyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 40,
  },
  urgencyButton: {
    borderBottomWidth: 2,
    borderColor: "transparent",
    paddingVertical: 6,
  },
  urgencyText: {
    fontSize: 16,
  },
  searchButtonFind: {
    backgroundColor: "#2962FF",
    borderRadius: 8,
    paddingVertical: 14,
    height: 50,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  searchButtonStop: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingVertical: 14,
    height: 50,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  logoutButton: {
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 14,
    color: "#757575",
    textDecorationLine: "underline",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  searchingText: {
    fontSize: 18,
    marginBottom: 30,
    color: "#333",
    fontWeight: "600",
  },
  infoFields: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "space-around",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  infoField: {
    justifyContent: "space-around",
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  pulseCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ff3b30",
    opacity: 0.6,
    marginBottom: 40,
  },
  cancelButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

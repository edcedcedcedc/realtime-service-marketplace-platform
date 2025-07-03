import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  Alert,
} from "react-native";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore, {
  Region,
  JobFormInput,
  DEFAULT_DELTA,
} from "../store/useStore";
import { SPACING } from "../utils/spacings";
import MapSelector from "./MapSelectorScreen";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { jobPostSchema } from "../validation/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";

import * as Location from "expo-location";

const defaultRegion: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function JobPostScreen({ navigation }: any) {
  const setTempJobData = useStore((state) => state.setTempJobData);
  const setLoading = useStore((state) => state.setLoading);
  const [isSearching, setIsSearching] = useState(false);
  const [showUrgencyHelp, setShowUrgencyHelp] = useState(false);

  const urgencyOptions: {
    label: string;
    value: string;
    color: string;
  }[] = [
    { label: "Now", value: "now", color: "#ff3b30" },
    { label: "Soon", value: "soon", color: "#ff9500" },
    { label: "Flexible", value: "flexible", color: "#34c759" },
  ];

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<JobFormInput>({
    resolver: yupResolver(jobPostSchema),
    defaultValues: {
      title: "",
      location: "",
      urgency: "now",
    },
  });

  useEffect(() => {
    return () => {
      reset();
      setLoading(false);
    };
  }, []);

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

    const latlng = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    setValue("location", latlng);
  };

  const urgency = watch("urgency");
  const onSubmit: SubmitHandler<JobFormInput> = async (formData) => {
    setIsSearching(true);
    setTempJobData(formData);
    const coordinates = useStore.getState().selectedLatLng;
    const payload = {
      ...formData,
      budget: formData.budget,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    };
    Keyboard.dismiss();
    try {
      const res = await api.post("/jobs/create/", payload);
      Toast.show({
        type: "success",
        text1: `Status: ${res.status}`,
        text2: JSON.stringify(res.data),
      });
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Failed to post a task",
        text2:
          err.response?.data ||
          "Something went wrong. Please check your internet connection.",
      });
    }
  };

  const cancelSearch = () => {
    setIsSearching(false);
  };

  const confirmSubmit = (data: JobFormInput) => {
    Alert.alert(
      "Confirm Search",
      "Are you sure you with the information provided ?",
      [
        {
          text: "No",
          onPress: () => {
            return false;
          },
        },
        {
          text: "Yes",
          onPress: () => {
            onSubmit(data);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const rejectSubmit = () => {
    Alert.alert(
      "Discard Search",
      "Are you sure you want to stop searching taskers ?",
      [
        {
          text: "No",
        },
        {
          text: "Yes",
          onPress: () => {
            cancelSearch();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="never"
        extraHeight={400}
        extraScrollHeight={20}
        keyboardOpeningTime={10000}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Text style={styles.heading}>What do you need?</Text>

            {/* Title */}
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.title && styles.inputError,
                      { color: isSearching ? "#999" : "#212121" },
                    ]}
                    placeholder="Task title (e.g walk with my dog)"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSearching}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  )}
                </>
              )}
            />

            {/* Description */}
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      styles.descriptionInput,
                      errors.description && styles.inputError,
                      { color: isSearching ? "#999" : "#212121" },
                    ]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    editable={!isSearching}
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>
                      {errors.description.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Budget */}
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.budget && styles.inputError,
                      { color: isSearching ? "#999" : "#212121" },
                    ]}
                    placeholder="Budget"
                    placeholderTextColor="#999"
                    value={value?.toString()}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    editable={!isSearching}
                  />
                  {errors.budget && (
                    <Text style={styles.errorText}>
                      {errors.budget.message}
                    </Text>
                  )}
                </>
              )}
            />

            {/* Location */}
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.location && styles.inputError,
                      { color: isSearching ? "#999" : "#212121" },
                    ]}
                    placeholder="Location"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!isSearching}
                  />
                  {errors.location && (
                    <Text style={styles.errorText}>
                      {errors.location.message}
                    </Text>
                  )}
                  <View>
                    <View style={styles.wrapper}>
                      <View style={{ display: "flex", alignItems: "center" }}>
                        <View
                          style={{
                            width: 200,
                            flexDirection: "row",
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            disabled={isSearching}
                            title="Use My Location"
                            onPress={() => handleGetLocation()}
                          />
                        </View>
                      </View>
                      <Text style={styles.helperText}>
                        You can choose your location manually if you don't
                        prefer exact location, just double tap the mini map.
                      </Text>
                    </View>
                    <MapSelector
                      address={value || ""}
                      isSearching={isSearching}
                      onExit={(region: Region) => {
                        const latlng = `${region.latitude.toFixed(
                          6
                        )}, ${region.longitude.toFixed(6)}`;
                        setValue("location", latlng);
                      }}
                      onChange={onChange}
                      handleGetLocation={handleGetLocation}
                    />
                  </View>
                </>
              )}
            />

            {/* Urgency Label with Help Icon */}
            <View style={styles.urgencyLabelWrapper}>
              <Text style={styles.label}>Urgency</Text>
              {/*  <TouchableOpacity
                onPress={() => setShowUrgencyHelp(!showUrgencyHelp)}
              >
                <Text style={styles.helpIcon}>?</Text>
              </TouchableOpacity> */}
            </View>

            {/* Urgency Help Text */}
            {/* {showUrgencyHelp && (
              <View style={styles.urgencyHelperBox}>
                <Text style={styles.urgencyHelperText}>
                  <Text style={{ fontWeight: "bold" }}>Now</Text> - tasker will
                  come in 15 minutes or the task will be canceled.{"\n"}
                  <Text style={{ fontWeight: "bold" }}>Soon</Text> - tasker will
                  come in 30 minutes or the task will be canceled.{"\n"}
                  <Text style={{ fontWeight: "bold" }}>Flexible</Text> - the
                  tasker will come in 1 hour.
                </Text>
              </View>
            )} */}

            {/* Urgency Buttons */}
            {!isSearching ? (
              <>
                <View style={styles.urgencyContainer}>
                  {urgencyOptions.map(({ label, value, color }) => {
                    const selected = urgency === value;
                    return (
                      <TouchableOpacity
                        disabled={isSearching}
                        key={value}
                        style={styles.urgencyButton}
                        onPress={() => setValue("urgency", value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.urgencyText,
                            selected ? { color: color } : { color: "#888" },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoFieldsRow}>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Workers in your area</Text>
                    <Text style={styles.infoValue}>12</Text>
                  </View>

                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Estimated wait</Text>
                    <Text style={styles.infoValue}>5 min</Text>
                  </View>
                </View>
                <View style={styles.infoFieldsRow}>
                  <View style={styles.infoField}>
                    <Text style={styles.infoLabel}>Incoming requests</Text>
                    <Text style={styles.infoValue}>5</Text>
                  </View>
                  <View>
                    <Button title="Inspect Requests" onPress={() => {}} />
                  </View>
                </View>
              </>
            )}

            {!isSearching ? (
              <TouchableOpacity
                onPress={handleSubmit(confirmSubmit)}
                style={styles.searchButtonFind}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Find</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={rejectSubmit}
                style={styles.searchButtonStop}
                activeOpacity={0.7}
              >
                <Text style={styles.searchButtonText}>Stop</Text>
              </TouchableOpacity>
            )}
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
  wrapper: {
    marginBottom: 16,
  },
  helperText: {
    marginTop: 6,
    fontSize: 13,
    color: "#777",
    textAlign: "center",
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
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#D32F2F",
    marginTop: -12,
    marginBottom: 12,
    fontSize: 13,
  },
  descriptionInput: {
    height: 50,
    paddingTop: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
    color: "#666",
  },
  urgencyLabelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  helpIcon: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF3B30",

    borderColor: "#FF3B30",
    borderRadius: 4,
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 18,
  },
  urgencyHelperBox: {
    backgroundColor: "#fff7f7",
    borderColor: "#FF3B30",

    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  urgencyHelperText: {
    color: "#212121",
    fontSize: 13,
    lineHeight: 18,
  },
  urgencyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
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
  infoFieldsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7.5,
    width: "100%",
  },
  infoField: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "50%",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "400",
    lineHeight: 18,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212121",
    lineHeight: 18,
    marginLeft: 8,
  },
});

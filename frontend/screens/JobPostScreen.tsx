/**
 * JobPostScreen Component
 *
 * This screen allows clients to create and submit a job request.
 * It features form fields for entering job title, description, budget,
 * location (manual or GPS-based), and urgency level.
 *
 * Key Features:
 * - Form validation via react-hook-form and Yup schema.
 * - Location selection with MapSelector and "Use My Location" option via Expo Location API.
 * - Urgency level buttons with visual feedback.
 * - Search initiation and cancellation logic.
 * - Automatic job creation after a 5-second delay using a timeout.
 * - Job deletion and toast notifications for feedback.
 * - UI adapts based on whether a search is active (`isSearching`).
 *
 * Dependencies:
 * - react-hook-form for form management
 * - yup for schema validation
 * - Zustand for global state management
 * - react-native-keyboard-aware-scroll-view for keyboard handling
 * - Toast notifications for feedback
 *
 * Props:
 * - navigation: React Navigation prop passed from the parent stack
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore, {
  Region,
  JobFormInput,
  DEFAULT_DELTA,
  DEFAULT_REGION,
} from "../store/useStore";
import { SPACING } from "../utils/spacings";
import MapSelector from "./MapSelectorScreen";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { jobPostSchema } from "../validation/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { URGENCY_OPTIONS, SUBCATEGORY_OPTIONS } from "../store/useStore";
import * as Location from "expo-location";

export default function JobPostScreen({ navigation }: any) {
  const setTempJobData = useStore().setTempJobData;
  const tempJobData = useStore((state) => state.tempJobData);
  const addJob = useStore().addJob;
  const jobs = useStore().jobs;
  const setLoading = useStore().setLoading;
  const [isSearching, setIsSearching] = useState(false);
  const jobCreationTimeout = useRef<NodeJS.Timeout | null>(null);
  const jobToBeCancelledIdRef = useRef<number | null>(null);
  const lastYOffset = useRef(0);
  const isAllowAutoScroll = useRef(false);
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
      category: "repair",
    },
  });
  const urgency = watch("urgency");

  const handleGetLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required to fetch your position.",
      );
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const latlng = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    setValue("location", latlng);
  };

  useEffect(() => {
    setTempJobData(null);
    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    if (!tempJobData) return;
    if (jobCreationTimeout.current) {
      clearTimeout(jobCreationTimeout.current);
    }
    jobCreationTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const coordinates = useStore.getState().selectedLatLng;
        const payload = {
          ...tempJobData,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        };
        const res = await api.post("/jobs/create/", payload);
        setTimeout(() => {
          Toast.show({
            type: "info",
            text1: "Created Job Id",
            text2: res.data.id,
          });
        }, 2000);
        jobToBeCancelledIdRef.current = res.data.id;
        addJob(res.data);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Failed to post a job",
          text2:
            err.response?.data ||
            "Something went wrong. Please check your internet connection.",
        });
      } finally {
        jobCreationTimeout.current = null;
        setLoading(false);
      }
    }, 5000);
    return () => {
      if (jobCreationTimeout.current) {
        clearTimeout(jobCreationTimeout.current);
        jobCreationTimeout.current = null;
      }
    };
  }, [tempJobData]);

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
      { cancelable: true },
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
      { cancelable: true },
    );
  };

  const onSubmit: SubmitHandler<JobFormInput> = async (formData) => {
    const current = useStore.getState().tempJobData;
    if (JSON.stringify(current) === JSON.stringify(formData)) return;
    setIsSearching(true);
    setTempJobData(formData);
  };

  const cancelSearch = () => {
    console.log(
      "Cancel search called, jobToBeCancelledId:",
      jobToBeCancelledIdRef.current,
    );
    setTimeout(() => {
      Toast.show({
        type: "info",
        text1: "Cancel search called, jobToBeCancelledId:",
        text2: `jobToBeCancelledIdRef.current ${jobToBeCancelledIdRef.current}`,
      });
    }, 2000);
    setIsSearching(false);
    setTempJobData(null);
    if (jobToBeCancelledIdRef.current) {
      deleteJobById();
    }
  };

  const deleteJobById = async () => {
    const jobId = jobs.find(
      (job) => jobToBeCancelledIdRef.current == job.id,
    )?.id;
    if (!jobId) return;
    try {
      const res = await api.delete(`/jobs/delete/${jobId}/`);
      console.log(
        res.data,
        " <= res.data for const res = await api.delete(`/jobs/delete/${jobId}/`);",
      );
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Job deleted",
          text2: `Job #${JSON.stringify(res.data, null, 2)}`,
        });
      }, 3000);
      const removeJob = useStore.getState().removeJob;
      removeJob(jobId);
      setTempJobData(null);
      jobToBeCancelledIdRef.current = null;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to cancel job",
        text2:
          err.response?.data?.error ||
          "Failed to cancel the job. Please try again later.",
      });
    } finally {
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const screenHeight = Dimensions.get("window").height / 5;
    const delta = yOffset - lastYOffset.current;
    if (delta >= screenHeight) {
      isAllowAutoScroll.current = false;
    } else {
      isAllowAutoScroll.current = true;
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraHeight={300}
        keyboardOpeningTime={2000}
        enableAutomaticScroll={isAllowAutoScroll.current}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
      >
        <View>
          <Text style={styles.heading}>What do you need?</Text>

          {/* Title */}
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoryContainer}>
                {["repair", "delivery", "personal_help", "other"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => onChange(cat)}
                    style={[
                      styles.categoryButton,
                      value === cat && styles.categoryButtonSelected,
                    ]}
                    disabled={isSearching}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        value === cat && styles.categoryTextSelected,
                      ]}
                    >
                      {cat.replace("_", " ").toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          <Controller
            control={control}
            name="subcategory"
            render={({ field: { onChange, value } }) => {
              const selectedCategory = watch("category");
              const options = SUBCATEGORY_OPTIONS[selectedCategory] || [];

              return (
                <View style={styles.subcategoryWrapper}>
                  <View style={styles.categoryContainer}>
                    {options.map((sub) => (
                      <TouchableOpacity
                        key={sub}
                        onPress={() => onChange(sub)}
                        style={[
                          styles.categoryButton,
                          value === sub && styles.categoryButtonSelected,
                        ]}
                        disabled={isSearching}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            value === sub && styles.categoryTextSelected,
                          ]}
                        >
                          {sub.replace(/_/g, " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {errors.subcategory && (
                    <Text style={styles.errorText}>
                      {errors.subcategory.message}
                    </Text>
                  )}
                </View>
              );
            }}
          />
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
                  textContentType="none"
                  autoComplete="off"
                  autoCorrect={false}
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
                  textContentType="none"
                  autoComplete="off"
                  autoCorrect={false}
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
                  value={value ? value.toString() : ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  editable={!isSearching}
                  textContentType="none"
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="no"
                  secureTextEntry={false}
                />
                {errors.budget && (
                  <Text style={styles.errorText}>{errors.budget.message}</Text>
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
                  textContentType="none" // Trick Apple into stopping suggestions
                  autoComplete="off"
                  autoCorrect={false}
                  spellCheck={false}
                  importantForAutofill="no"
                  secureTextEntry={false}
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
                      You can choose your location manually if you don't prefer
                      exact location, just double tap the mini map.
                    </Text>
                  </View>
                  <MapSelector
                    address={value || ""}
                    isSearching={isSearching}
                    onExit={(region: Region) => {
                      const latlng = `${region.latitude.toFixed(
                        6,
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
                {URGENCY_OPTIONS.map(({ label, value, color }) => {
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
  subcategoryWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: "#888",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: "#f0f0f0",
  },
  categoryButtonSelected: {
    backgroundColor: "#2962FF",
    borderColor: "#2962FF",
  },
  categoryText: {
    color: "#333",
    fontSize: 14,
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from "react-native";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { yupResolver } from "@hookform/resolvers/yup";
import useStore, { Region, TaskFormInput } from "../store/useStore";
import { taskPostSchema } from "../validation/validationSchema";
import { URGENCY_OPTIONS, SUBCATEGORY_OPTIONS } from "../store/useStore";
import { COLORS } from "../constants/colors";
import { SPACING } from "../constants/dimensions";
import IncomingRequestsModal from "./InspectRequestsModal";
import MapSelector from "./MapSelector";
import api from "../services/api";
import { useTaskFeed } from "../hooks/useTaskFeed";
import { useTaskRequest } from "../hooks/useTaskRequest";
import { withTimeout } from "../utils/withTimeout";

export default function TaskPost({ navigation }: any) {
  const setTempTaskData = useStore().setTempTaskData;
  const tempTaskData = useStore((state) => state.tempTaskData);
  const tasks = useStore().tasks;

  const isSearching = useStore((state) => state.isSearching);
  const setIsSearching = useStore().setIsSearching;
  const taskCreationTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastYOffset = useRef(0);
  const [isAllowAutoScroll, setIsAllowAutoScroll] = useState(true);
  const currentTaskId = useStore((state) => state.currentTaskId);
  const [taskerRequestsVisible, setTaskerRequestsVisible] = useState(false);
  const taskRequests = useStore((state) => state.taskRequests);
  const setCurrentTaskId = useStore().setCurrentTaskId;
  const isConnected = useStore((state) => state.isConnected);
  const setRefreshTaskFeedSocket = useStore().setRefreshTaskFeedSocket;
  const setRefreshTaskRequestSocket = useStore().setRefreshTaskRequestSocket;
  /* const snackbarVisible = useStore((state) => state.snackbarVisible);
  const setSnackbarVisible = useStore().setSnackbarVisible; */
  const refreshTaskFeedSocket = useStore(
    (state) => state.refreshTaskFeedSocket
  );

  useTaskFeed();
  useTaskRequest();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TaskFormInput>({
    resolver: yupResolver(taskPostSchema),
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
        "Location permission is required to fetch your position."
      );
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const latlng = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    setValue("location", latlng);
  };

  useEffect(() => {
    return () => {
      reset();
      setTempTaskData(null);
      setIsSearching(false);
      Toast.hide();
    };
  }, []);

  useEffect(() => {
    if (!tempTaskData) return;
    if (taskCreationTimeout.current) {
      clearTimeout(taskCreationTimeout.current);
    }

    taskCreationTimeout.current = setTimeout(async () => {
      try {
        const coordinates = useStore.getState().selectedLatLng;

        const payload = {
          ...tempTaskData,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        };

        const res = await api.post("/tasks/create/", payload);
        setCurrentTaskId(res.data.id);
        setRefreshTaskRequestSocket();
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Failed to post a task",
          text2:
            err.response?.data ||
            "Something went wrong. Please check your internet connection.",
        });
      } finally {
        taskCreationTimeout.current = null;
      }
    }, 5000);

    return () => {
      if (taskCreationTimeout.current) {
        clearTimeout(taskCreationTimeout.current);
        taskCreationTimeout.current = null;
      }
      setCurrentTaskId(null);
    };
  }, [tempTaskData]);

  const confirmSubmit = (data: TaskFormInput) => {
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

  const onSubmit: SubmitHandler<TaskFormInput> = async (formData) => {
    const current = useStore.getState().tempTaskData;
    if (JSON.stringify(current) === JSON.stringify(formData)) return;

    setIsSearching(true);
    if (!isConnected) {
      setIsSearching(false);
      /*  setSnackbarVisible(true); */
      return;
    }
    setTempTaskData(formData);
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setTempTaskData(null);
    deleteTaskById();
  };

  /* 
  trigger refresh
  get both sockets working 
  api delete 
  set current task id null
  regrigger 
  
  */
  function deleteTaskById() {
    let count = 0;

    const pollDelete = async () => {
      count += 1;

      if (!currentTaskId || count > 20) return;

      const id = tasks.find((task) => currentTaskId === task.id)?.id;

      if (!id) return;

      try {
        setRefreshTaskFeedSocket();
        await withTimeout(api.delete(`/tasks/delete/${id}/`));
        setCurrentTaskId(null);
        setRefreshTaskRequestSocket();
        Toast.show({
          type: "success",
          text1: "Task cancelled successfully",
        });
      } catch (err: any) {
        if (!currentTaskId) {
          return;
        } else {
          Toast.show({
            type: "error",
            text1: "Failed to cancel task",
            text2:
              err.response?.data?.error || "Retrying to cancel the task...",
          });
          setTimeout(pollDelete, 5000);
        }
      }
    };

    pollDelete();
  }

  const cancelAllRequests = async () => {
    try {
      await api.post("/tasks/cancel-all-task-requests/", {
        task_id: currentTaskId!,
      });
      Toast.show({
        type: "success",
        text1: "Cancelled all tasker requests",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to cancel all requests",
        text2: err.response?.data?.error || "Try again later",
      });
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const screenHeight = Dimensions.get("window").height / 5;
    const delta = yOffset - lastYOffset.current;
    if (delta >= screenHeight) {
      setIsAllowAutoScroll(false);
    } else {
      setIsAllowAutoScroll(true);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraHeight={300}
        keyboardOpeningTime={250}
        enableAutomaticScroll={isAllowAutoScroll}
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
                    { color: isSearching ? COLORS.color25 : COLORS.color27 },
                  ]}
                  placeholder="Task title (e.g walk with my dog)"
                  placeholderTextColor={COLORS.color25}
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
                    { color: isSearching ? COLORS.color25 : COLORS.color27 },
                  ]}
                  placeholder="Description"
                  placeholderTextColor={COLORS.color25}
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
                    { color: isSearching ? COLORS.color25 : COLORS.color27 },
                  ]}
                  placeholder="Budget"
                  placeholderTextColor={COLORS.color25}
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
                    { color: isSearching ? COLORS.color25 : COLORS.color27 },
                  ]}
                  placeholder="Location"
                  placeholderTextColor={COLORS.color25}
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
                      You can select the exact location, but it will be slightly
                      shifted (±500 meters) for safety reasons until the task
                      begins. To enlarge the map, simply double-tap it.
                    </Text>
                  </View>
                  <MapSelector
                    address={value || ""}
                    isSearching={isSearching}
                    onExit={(region: Region) => {
                      const latlng = `${region.latitude.toFixed(6)}, ${region.longitude.toFixed(6)}`;
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
            {!isSearching && <Text style={styles.label}>Urgency</Text>}
          </View>
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
                          selected
                            ? { color: color }
                            : { color: COLORS.color30 },
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
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Text style={styles.infoLabel}>Workers in your area:</Text>
                  <Text style={styles.infoValue}>12</Text>
                </View>
                <View style={{ display: "flex", flexDirection: "row" }}>
                  <Text style={styles.infoLabel}>Estimated wait:</Text>
                  <Text style={styles.infoValue}>5 min</Text>
                </View>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Text style={styles.infoLabel}>Incoming requests:</Text>
                  <Text style={styles.infoValue}>{taskRequests.length}</Text>
                </View>
                <View style={{ marginRight: -2 }}>
                  <Button
                    title="Inspect Requests"
                    onPress={() => {
                      setTaskerRequestsVisible(true);
                    }}
                  />
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
          {taskerRequestsVisible && (
            <IncomingRequestsModal
              visible={true}
              onClose={() => setTaskerRequestsVisible(false)}
              onAccept={(id) => console.log("Accepted:", id)}
              onDecline={(id) => {}}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    backgroundColor: COLORS.color31,
    borderColor: COLORS.color30,
    borderRadius: 6,
    borderWidth: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.color16,
    borderColor: COLORS.color16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  categoryText: {
    color: COLORS.color11,
    fontSize: 14,
  },
  categoryTextSelected: {
    color: COLORS.color19,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  descriptionInput: {
    height: 50,
    paddingTop: 13,
  },
  errorText: {
    color: COLORS.color5,
    fontSize: 13,
    marginBottom: 12,
    marginTop: -12,
  },
  heading: {
    color: COLORS.color27,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  helpIcon: {
    borderColor: COLORS.color7,
    borderRadius: 4,
    color: COLORS.color7,
    fontSize: 16,

    fontWeight: "bold",
    height: 20,
    lineHeight: 18,
    marginLeft: 8,
    textAlign: "center",
    width: 20,
  },
  helperText: {
    color: COLORS.color32,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
  },
  infoField: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    width: "50%",
  },
  infoFieldsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  infoLabel: {
    color: COLORS.color15,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  infoValue: {
    color: COLORS.color27,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
    marginLeft: 8,
  },
  input: {
    backgroundColor: COLORS.color19,
    borderColor: COLORS.color26,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.color27,
    elevation: 2,
    fontSize: 16,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "100%",
  },
  inputError: {
    borderColor: COLORS.color5,
  },
  label: {
    color: COLORS.color15,
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
  },
  scrollContent: {
    alignItems: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  searchButtonFind: {
    alignItems: "center",
    backgroundColor: COLORS.color16,
    borderRadius: 8,
    elevation: 3,
    height: 50,
    marginBottom: 16,
    paddingVertical: 14,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchButtonStop: {
    alignItems: "center",
    backgroundColor: COLORS.color33,
    borderRadius: 8,
    elevation: 3,
    height: 50,
    marginBottom: 16,
    paddingVertical: 14,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchButtonText: {
    color: COLORS.color19,
    fontSize: 16,
    fontWeight: "700",
  },
  subcategoryWrapper: {
    display: "flex",
    flexDirection: "column",
  },
  urgencyButton: {
    borderBottomWidth: 2,
    borderColor: "transparent",
    paddingVertical: 6,
  },
  urgencyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  urgencyHelperBox: {
    backgroundColor: COLORS.color34,
    borderColor: COLORS.color7,

    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  urgencyHelperText: {
    color: COLORS.color27,
    fontSize: 13,
    lineHeight: 18,
  },
  urgencyLabelWrapper: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 6,
  },
  urgencyText: {
    fontSize: 16,
  },
  wrapper: {
    marginBottom: 16,
  },
});

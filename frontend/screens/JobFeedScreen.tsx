import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions, Text } from "react-native";
import api from "../services/api";
import useStore, { Job } from "../store/useStore";
import Toast from "react-native-toast-message";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../utils/spacings";
import MapSelector from "./MapSelectorScreen";
import * as Location from "expo-location";
import JobCard from "./JobCardScreen";
import JobSearchBar from "./JobSearchBarScreen";

const HEADER_HEIGHT = 120; // approx header + logout button height
const COOLDOWN_MS = 5000;

export default function JobFeedScreen({ navigation }: { navigation: any }) {
  const jobs = useStore((state) => state.jobs);
  const removeJob = useStore((state) => state.removeJob);
  const setJobs = useStore().setJobs;
  const addJob = useStore().addJob;
  const loading = useStore((state) => state.loading);
  console.log(loading, "loading");
  const setLoading = useStore().setLoading;
  const lastRefreshRef = useRef(0);
  const [hasPulled, setHasPulled] = useState(false);
  const scrollOffsetRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await withTimeout(api.get("/jobs/open/"));
      setJobs(response.data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Cannot fetch the tasks",
        text2:
          err.response?.data?.error || "Please check your internet connection",
      });
    } finally {
      setLoading(false);
      setHasPulled(false);
    }
  };

  const onViewDetails = (job: Job) => {
    navigation.navigate("JobDetails", { jobId: job.id });
  };

  const onButtonPress = (job: Job, action: string) => {
    alert(`${action} pressed for job: ${job.title}`);
  };

  const onScroll = (event: any) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };
  const onScrollEndDrag = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;

    const now = Date.now();
    if (
      offsetY < -80 &&
      !hasPulled &&
      !loading &&
      now - lastRefreshRef.current > COOLDOWN_MS
    ) {
      setHasPulled(true);
      lastRefreshRef.current = now;
      fetchJobs();
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(value.toLowerCase()) ||
      job.description?.toLowerCase().includes(value.toLowerCase()) ||
      job.urgency.toLowerCase().includes(value.toLowerCase()) ||
      job.location.toLowerCase().includes(value.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.mascotPlaceholder} />
      <JobSearchBar value={value} onChangeText={setValue} />
      <FlatList
        data={filteredJobs}
        keyExtractor={(item, index) => {
          if (!item?.id) {
            console.warn("⚠️ Missing job ID at index", index, item);
            return index.toString();
          }
          return item.id.toString();
        }}
        renderItem={({ item }) => <JobCard item={item} />}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Text style={{ fontSize: 16, color: "#999" }}>
              No tasks found matching your search.
            </Text>
          </View>
        }
        scrollEventThrottle={300}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEnabled={!loading}
      />
    </View>
  );
}

const statusColors: Record<string, object> = {
  open: { color: "#1976d2" }, // Blue
  confirmed: { color: "#fbc02d" },
  "in-progress": { color: "#388e3c" }, // Green
  completed: { color: "#388E3C" },
  cancelled: { color: "#d32f2f" }, // Red
  expired: { color: "#757575" }, // Grey
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    backgroundColor: "#fff",
  },
  mascotPlaceholder: {
    height: 100, // or whatever height fits your mascot image
    width: "100%",
    // Optionally center or add background color if you want visual debugging:
    // backgroundColor: '#eee',
    marginBottom: SPACING.sm, // space below mascot before search bar
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: "#fff",
    zIndex: 10,
    elevation: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40, // status bar height padding
  },
  header: {
    fontWeight: "700",
    fontSize: 28,
    color: "#222",
  },
  logoutButton: {
    position: "absolute",
    right: 16,
    bottom: 10,
    borderColor: "#6200ee", // same as login/register
    borderWidth: 1.5,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: "#6200ee",
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    alignContent: "center",
    alignItems: "center",

    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    alignSelf: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: "#555",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#444",
  },
  status: {
    fontWeight: "700",
    fontSize: 13,
    textTransform: "uppercase",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 4,
    alignItems: "center",
  },
  blueButton: {
    backgroundColor: "#6200ee", // same as login/register
  },
  yellowButton: {
    backgroundColor: "#fbc02d",
  },
  greenButton: {
    backgroundColor: "#388e3c",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

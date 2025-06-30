import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import api from "../services/api";
import useStore, { Job } from "../store/useStore";
import Toast from "react-native-toast-message";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../utils/spacings";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 120; // approx header + logout button height
const COOLDOWN_MS = 5000;

export default function JobFeedScreen({ navigation }: { navigation: any }) {
  const jobs = useStore((state) => state.jobs);
  const setJobs = useStore((state) => state.setJobs);
  const addJob = useStore((state) => state.addJob);
  const loading = useStore((state) => state.loading);
  const setLoading = useStore((state) => state.setLoading);
  const lastRefreshRef = useRef(0);
  const [hasPulled, setHasPulled] = useState(false);
  const scrollOffsetRef = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  console.log("🌀 UI rerendered, jobs length:", jobs.length);
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

  const logout = () => navigation.replace("Start");

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

  const renderJob = ({ item }: { item: Job }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>
            Budget: ${Number(item.budget).toFixed(2)}
          </Text>
          <Text style={styles.infoText}>Urgency: {item.urgency}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Location: {item.location}</Text>
          <Text style={[styles.status, statusColors[item.status] || {}]}>
            {item.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.blueButton]}
            onPress={() => onViewDetails(item)}
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.yellowButton]}
            onPress={() => onButtonPress(item, "Action 1")}
          >
            <Text style={styles.buttonText}>Action 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => onButtonPress(item, "Action 2")}
          >
            <Text style={styles.buttonText}>Action 2</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Jobs Feed</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderJob}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: 80,
        }}
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
  accepted: { color: "#fbc02d" }, // Yellow
  "in-progress": { color: "#388e3c" }, // Green
  completed: { color: "#388e3c" },
  confirmed: { color: "#388e3c" },
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
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    width: width - 32,
    alignSelf: "center",
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    color: "#222",
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

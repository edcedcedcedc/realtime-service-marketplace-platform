import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import api from "../services/api";
import useStore, { Job } from "../store/useStore";
import Toast from "react-native-toast-message";
const { width } = Dimensions.get("window");

export default function JobsFeedScreen({ navigation }: { navigation: any }) {
  const { setAuth, setLoading } = useStore.getState();
  const [error, setError] = useState("");
  const jobs = useStore((state) => state.jobs);
  const setJobs = useStore((state) => state.setJobs);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    console.log(jobs);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/jobs/open/");
      setJobs(response.data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Cannot fetch the tasks",
        text2:
          err.response?.data?.error ||
          "Please check your internet connection or type to support",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => navigation.replace("Start");

  const onViewDetails = (job: Job) => {
    navigation.navigate("JobDetails", { jobId: job.id });
  };

  const onButtonPress = (job: Job, action: string) => {
    // Placeholder for other button actions
    alert(`${action} pressed for job: ${job.title}`);
  };

  const renderJob = ({ item }: { item: Job }) => (
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Jobs Feed</Text>

      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJob}
          contentContainerStyle={{ paddingBottom: 80 }}
          scrollEnabled={false} // Disable nested scroll, since inside ScrollView
        />
      )}
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  header: {
    fontWeight: "700",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 24,
    color: "#222",
  },
  logoutButton: {
    alignSelf: "center",
    borderColor: "#6200ee", // Same as login/register
    borderWidth: 1.5,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#6200ee",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#999",
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: "#d32f2f",
    fontWeight: "600",
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

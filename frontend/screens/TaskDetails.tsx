import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import useStore, { Task } from "../store/useStore";

export default function TaskDetailsScreen() {
  const route = useRoute<RouteProp<{ params: { taskId: number } }, "params">>();
  const taskId = route.params.taskId;
  const task = useStore((state) => state.tasks.find((t) => t.id === taskId));

  if (!task) {
    return;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.label}>Description</Text>
      <Text style={styles.text}>{task.description}</Text>
      <Text style={styles.label}>Budget</Text>
      <Text style={styles.text}>€{Number(task.budget)}</Text>
      <Text style={styles.label}>Urgency</Text>
      <Text style={styles.text}>{task.urgency}</Text>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.text}>{task.location}</Text>
      <Text style={styles.label}>Category</Text>
      <Text style={styles.text}>General</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6200ee",
    marginTop: 12,
  },
  text: {
    fontSize: 15,
    color: "#333",
    marginTop: 4,
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    alignSelf: "center",
    marginTop: 40,
  },
});

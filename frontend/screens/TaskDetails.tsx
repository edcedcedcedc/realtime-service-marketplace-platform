import React from "react";
import { Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

import useStore from "../store/useStore";
import { COLORS } from "../constants/colors";

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
    backgroundColor: COLORS.color19,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  errorText: {
    alignSelf: "center",
    color: COLORS.color5,
    fontSize: 18,
    marginTop: 40,
  },
  label: {
    color: COLORS.color10,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  text: {
    color: COLORS.color11,
    fontSize: 15,
    marginTop: 4,
  },
  title: {
    color: COLORS.color14,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});

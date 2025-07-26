import React from "react";
import { View, Text, Button, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/colors";
import { TaskRequest } from "../store/useStore";

const { width } = Dimensions.get("window");

type Props = {
  item: TaskRequest;
  handleAccept: (taskerId: number, taskId: number) => void;
  handleDecline: (taskerId: number, taskId: number) => void;
  disableInteraction: boolean;
};

export default function TaskRequestCard({
  item,
  handleAccept,
  handleDecline,
  disableInteraction,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.tasker_username}</Text>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Name: {item.tasker_name}</Text>
        <Text style={styles.infoText}>Family: {item.tasker_family_name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Specialization: {item.category}</Text>
        <Text style={styles.infoText}>Tasks Done: {item.tasks_done}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>Rating: {item.tasker_rating} ★</Text>
        <Text style={styles.infoText}>ETA: {item.eta}</Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          title="Decline"
          onPress={() => handleDecline(item.tasker_id, item.task_id)}
          disabled={disableInteraction}
        />
        <Button
          title="Accept"
          onPress={() => handleAccept(item.tasker_id, item.task_id)}
          disabled={disableInteraction}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: COLORS.color19,
    borderColor: COLORS.color18,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    width: width - 32,
  },
  title: {
    color: COLORS.color11,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.color12,
    fontSize: 13,
  },
});

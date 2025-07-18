import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Button } from "react-native";
import { Portal, Dialog, Paragraph } from "react-native-paper";

import useStore, {
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  Task,
} from "../store/useStore";
import { COLORS } from "../constants/colors";
import MapSelector from "./MapSelector";
import api from "../services/api";
import TinySpinner from "../components/TinySpinner";
import Toast from "react-native-toast-message";
import { SocketManager } from "../utils/socketManager";

const { width } = Dimensions.get("window");

const urgencyColorMap = URGENCY_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option.color;
    return map;
  },
  {} as Record<string, string>,
);

const statusColorMap = STATUS_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option.color;
    return map;
  },
  {} as Record<string, string>,
);

type TaskCardProps = {
  task: Task;
  isMiniMapVisible: boolean;
};

export default function TaskCard({ task, isMiniMapVisible }: TaskCardProps) {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const user = useStore((state) => state.auth.user);

  async function handleAccept() {
    try {
      const res = await api.post("task-request/", {
        task_id: Number(task.id),
      });
      console.log(res.data);
      setDialogVisible(true);
    } catch (error) {
      setDialogVisible(false);
      alert("Error: Failed to send accept request.");
      console.error(error);
    }
  }

  async function handleCancelRequest() {
    try {
      await api.post("cancel-task-request/", {
        task_id: Number(task.id),
      });
      setDialogVisible(false);
      //setActiveOutgoingRequestTaskId(null);
    } catch (error) {
      alert("Failed to cancel request.");
    }
  }

  useEffect(() => {
    if (!isMiniMapVisible && showMiniMap) {
      setShowMiniMap(false);
    }
  }, [isMiniMapVisible]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-evenly",
          marginBottom: 8,
        }}
      >
        <View>
          <Text style={styles.infoText}>
            Budget: ${Number(task.budget).toFixed(2)}
          </Text>
          <Text style={styles.infoText}>
            Status:{" "}
            <Text
              style={{
                color: statusColorMap[task.status] || COLORS.color12,
                fontWeight: "600",
              }}
            >
              {task.status}
            </Text>
          </Text>
        </View>

        <View>
          <Text style={styles.infoText}>
            Category:{" "}
            {task.category === "repair"
              ? "Fix & Repair"
              : task.category === "personal_help"
                ? "Personal Help"
                : task.category === "delivery"
                  ? "Move & Deliver"
                  : task.category === "other"
                    ? "Other"
                    : task.category}
          </Text>
          <Text style={styles.infoText}>
            Urgency:
            <Text
              style={{ color: urgencyColorMap[task.urgency] || COLORS.color12 }}
            >
              {" " + task.urgency}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.centeredRow}>
        <Text style={[styles.infoText, styles.centeredText]}>
          Location: {task.location}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          title={showMiniMap ? "Hide Location" : "View Location"}
          onPress={() => setShowMiniMap((show) => !show)}
        />
        <Button title="Accept" onPress={handleAccept} />
      </View>

      {showMiniMap && (
        <MapSelector
          address={task.location}
          isSearching={false}
          onExit={() => setShowMiniMap(false)}
          onChange={() => {}}
          handleGetLocation={() => {}}
        />
      )}

      {/* Paper Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={handleCancelRequest}
          dismissable={false}
        >
          <Dialog.Title>Request Sent</Dialog.Title>
          <Dialog.Content>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ paddingRight: 10 }}>
                Waiting for client to respond
              </Text>
              <TinySpinner message="" />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCancelRequest} color="red" title="Cancel" />
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  centeredRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    width: "100%",
  },
  centeredText: {
    maxWidth: "90%",
    textAlign: "center",
  },
  description: {
    color: COLORS.color13,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  infoText: {
    color: COLORS.color12,
    fontSize: 13,
  },
  title: {
    color: COLORS.color11,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Button,
} from "react-native";
import { COLORS } from "../constants/colors";
import useStore from "../store/useStore";
import api from "../services/api";
import Toast from "react-native-toast-message";
import { TaskRequest } from "../store/useStore";

const { width } = Dimensions.get("window");

export default function InspectRequestsModal({
  visible,
  onClose,
  taskRequests,
  currentTaskId,
  handleAccept,
  handleDecline,
}: {
  visible: boolean;
  onClose: () => void;
  taskRequests: any[];
  currentTaskId: number | null;
  handleAccept: (taskerId: number, taskId: number) => void;
  handleDecline: (taskerId: number, taskId: number) => void;
}) {
  const setTaskRequests = useStore().setTaskRequests;
  const isConnected = useStore((state) => state.isConnected);
  const requestsRef = useRef<NodeJS.Timeout | null>(null);
  const [cancelDisabled, setCancelDisabled] = useState(true);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const timeout = setTimeout(() => {
      setCancelDisabled(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      setCancelDisabled(true);
    };
  }, [taskRequests]);

  useEffect(() => {
    let wasOffline = false;
    if (!isConnected) wasOffline = true;

    if (isConnected && wasOffline && currentTaskId) {
      const timeout = setTimeout(async () => {
        try {
          const res = await api.get(`/task-requests/${currentTaskId}/`);
          setTaskRequests(res.data);
          Toast.show({
            type: "info",
            text1: "Polled after reconnect",
          });
        } catch (e) {
          console.warn("Polling error:", e);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [isConnected, currentTaskId]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Incoming Requests</Text>

          <FlatList
            data={taskRequests}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No tasker accepted this task yet...
              </Text>
            }
            renderItem={({ item }: { item: TaskRequest }) => {
              const disableInteraction = cancelDisabled || !isConnected;

              return (
                <View style={styles.card}>
                  <Text style={styles.title}>{item.tasker_username}</Text>
                  <Text style={styles.infoText}>Name: {item.tasker_name}</Text>
                  <Text style={styles.infoText}>
                    Family: {item.tasker_family_name}
                  </Text>
                  <Text style={styles.infoText}>
                    Specialization: {item.category}
                  </Text>
                  <Text style={styles.infoText}>
                    Tasks Done: {item.tasks_done}
                  </Text>
                  <Text style={styles.infoText}>
                    Rating: {item.tasker_rating} ★
                  </Text>
                  <Text style={styles.infoText}>ETA: {item.eta}</Text>

                  <View style={styles.buttonRow}>
                    <Button
                      title="Accept"
                      onPress={() => handleAccept(item.tasker_id, item.task_id)}
                      disabled={disableInteraction}
                    />
                    <Button
                      disabled={disableInteraction}
                      title="Decline"
                      onPress={() =>
                        handleDecline(item.tasker_id, item.task_id)
                      }
                    />
                  </View>
                </View>
              );
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 24,
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#bdbdbd",
  },
  disabledText: {
    color: "#eee",
  },
});

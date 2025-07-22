import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Button,
} from "react-native";
import { COLORS } from "../constants/colors";
import useStore from "../store/useStore";
import api from "../services/api";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

type InspectRequestsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (id: string | number) => void;
  onDecline: (id: string | number) => void;
};

export default function InspectRequestsModal({
  visible,
  onClose,
}: InspectRequestsModalProps) {
  const requests = useStore((state) => state.taskRequests);
  const deleteTaskRequest = useStore().deleteTaskRequest;
  const setRequests = useStore().setRequests;
  const currentTaskId = useStore((state) => state.currentTaskId);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchTaskRequests = async () => {
      if (!currentTaskId) return; //by the client, he is inside modal
      try {
        const response = await api.get(`/task-requests/${currentTaskId}/`);
        const data = response.data;
        Toast.show({
          type: "info",
          text1: `Polling from /task-requests/${currentTaskId}/`,
          text2: "Inspect request modal",
        });
        setRequests(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchTaskRequests();
    interval = setInterval(fetchTaskRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCancelTaskRequestClient = async (
    taskerId: number,
    taskId: number
  ) => {
    try {
      const res = await api.post("cancel-task-request-as-client/", {
        task_id: taskId,
        tasker_id: taskerId,
      });
      deleteTaskRequest(res.data.id);
    } catch (error) {
      console.warn(error, `Failed to cancel request`);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Incoming Requests</Text>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: 50,
                }}
              >
                {requests.length === 0 && (
                  <Text style={{ fontSize: 16, color: COLORS.color25 }}>
                    No tasker accept this task yet...
                  </Text>
                )}
              </View>
            }
            renderItem={({ item }) => {
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
                    Task Done: {item.tasks_done}
                  </Text>
                  <Text style={styles.infoText}>
                    Rating: {item.tasker_rating} ★
                  </Text>
                  <Text style={styles.infoText}>ETA: {item.eta} min</Text>
                  <View style={styles.buttonRow}>
                    <Button title="Accept" />
                    <Button
                      title="Decline"
                      onPress={() =>
                        handleCancelTaskRequestClient(
                          item.tasker_id,
                          item.task_id
                        )
                      }
                    />
                  </View>
                </View>
              );
            }}
          />
          <Button title="Close" onPress={onClose} />
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
    backgroundColor: COLORS.color19,
    borderRadius: 12,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.color11,
    textAlign: "center",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 12,
  },
  card: {
    alignContent: "center",
    alignItems: "center",

    borderColor: COLORS.color18,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.color11,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.color12,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: COLORS.color16,
  },
  declineButton: {
    backgroundColor: COLORS.color5,
  },
  buttonText: {
    color: COLORS.color19,
    fontWeight: "600",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: COLORS.color30,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.color19,
    fontWeight: "600",
    fontSize: 15,
  },
});

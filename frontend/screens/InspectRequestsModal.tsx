import React from "react";
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

const { width } = Dimensions.get("window");

interface Request {
  task_id: number;
  tasker_id: number;
  tasker_username: string;
  tasker_name: string;
  tasker_family_name: string;
  rating: number;
  specialization: string; //category
  tasks_done: number;
  eta: number;
}

type InspectRequestsModalProps = {
  visible: boolean;
  onClose: () => void;
  onAccept: (id: string | number) => void;
  onDecline: (id: string | number) => void;
  requests: Request[];
};

export default function InspectRequestsModal({
  visible,
  onClose,
  onAccept,
  onDecline,
  requests,
}: InspectRequestsModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.heading}>Incoming Requests</Text>
          <FlatList
            data={requests}
            keyExtractor={(item) => item.task_id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.title}>{item.tasker_username}</Text>
                <Text style={styles.infoText}>Name: {item.tasker_name}</Text>
                <Text style={styles.infoText}>
                  Family: {item.tasker_family_name}
                </Text>
                <Text style={styles.infoText}>
                  Specialization: {item.specialization}
                </Text>
                <Text style={styles.infoText}>
                  Task Done: {item.tasks_done}
                </Text>
                <Text style={styles.infoText}>Rating: {item.rating} ★</Text>
                <Text style={styles.infoText}>ETA: {item.eta} min</Text>
                <View style={styles.buttonRow}>
                  <Button title="Accept" />
                  <Button title="Decline" />
                </View>
              </View>
            )}
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
    fontSize: 20,
    fontWeight: "700",
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

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";

import { COLORS } from "../constants/colors";
import { SPACING } from "../constants/dimensions";
import TinySpinner from "../components/TinySpinner";

type Props = {
  title: string;
  onCancel: () => void;
};

export default function TaskSubmittedModal({ title, onCancel }: Props) {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Task Submitted</Text>

        <View style={styles.card}>
          {/* <Text style={styles.titleLabel}>Title</Text> */}
          {/* <Text style={styles.titleText}>{title}</Text> */}

          <View style={styles.descriptionRow}>
            <Text style={styles.descriptionText}>
              Waiting for client to respond
            </Text>
            <TinySpinner />
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.color19,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.md,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.color27,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.color31,
    padding: 20,
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  titleLabel: {
    color: COLORS.color15,
    fontSize: 14,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    color: COLORS.color27,
    fontWeight: "600",
    marginBottom: 16,
  },
  descriptionRow: {
    flexDirection: "row",

    justifyContent: "space-around",
    marginBottom: 24,
  },
  descriptionText: {
    color: COLORS.color15,
    fontSize: 15,
    fontWeight: "400",
  },
  cancelButton: {
    backgroundColor: COLORS.color33,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.color19,
    fontSize: 16,
    fontWeight: "700",
  },
});

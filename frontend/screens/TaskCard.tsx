import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Button,
  Alert,
} from "react-native";

import { URGENCY_OPTIONS, STATUS_OPTIONS } from "../store/useStore";
import { COLORS } from "../constants/colors";
import MapSelector from "./MapSelector";
import api from "../services/api"; // your axios instance

const { width } = Dimensions.get("window");

const urgencyColorMap = URGENCY_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option.color;
    return map;
  },
  {} as Record<string, string>
);

const statusColorMap = STATUS_OPTIONS.reduce(
  (map, option) => {
    map[option.value] = option.color;
    return map;
  },
  {} as Record<string, string>
);

type TaskCardProps = {
  item: {
    id: number | string;
    title: string;
    description?: string;
    budget: number;
    urgency: string;
    location: string;
    status: string;
    category: string;
  };
  isMiniMapVisible: boolean;
};

export default function TaskCard({ item, isMiniMapVisible }: TaskCardProps) {
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [showTaskSubmitted, setShowTaskSubmitted] = useState(false);

  // For demo: hardcoded ETA, can be user input if you want
  const eta = "15 min";

  async function handleAccept() {
    try {
      setShowTaskSubmitted(true);

      await api.post("task_request/", {
        task_id: item.id,
      });

      Alert.alert(
        "Request Sent",
        "Waiting for client to respond",
        [
          {
            text: "Cancel",
            onPress: () => setShowTaskSubmitted(false),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      setShowTaskSubmitted(false);
      Alert.alert("Error", "Failed to send accept request.");
      console.error(error);
    }
  }

  useEffect(() => {
    if (!isMiniMapVisible && showMiniMap) {
      setShowMiniMap(false);
    }
  }, [isMiniMapVisible]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {item.description}
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
            Budget: ${Number(item.budget).toFixed(2)}
          </Text>
          <Text style={styles.infoText}>
            Status:{" "}
            <Text
              style={{
                color: statusColorMap[item.status] || COLORS.color12,
                fontWeight: "600",
              }}
            >
              {item.status}
            </Text>
          </Text>
        </View>

        <View>
          <Text style={styles.infoText}>
            Category:{" "}
            {item.category === "repair"
              ? "Fix & Repair"
              : item.category === "personal_help"
                ? "Personal Help"
                : item.category === "delivery"
                  ? "Move & Deliver"
                  : item.category === "other"
                    ? "Other"
                    : item.category}
          </Text>
          <Text style={styles.infoText}>
            Urgency:
            <Text
              style={{ color: urgencyColorMap[item.urgency] || COLORS.color12 }}
            >
              {" " + item.urgency}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.centeredRow}>
        <Text style={[styles.infoText, styles.centeredText]}>
          Location: {item.location}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          title={showMiniMap ? "Hide Location" : "View Location"}
          onPress={() => setShowMiniMap((show) => !show)}
        />
        <Button
          title="Accept"
          onPress={handleAccept}
          disabled={showTaskSubmitted} // disable while sending
        />
      </View>

      {showMiniMap && (
        <MapSelector
          address={item.location}
          isSearching={false}
          onExit={() => setShowMiniMap(false)}
          onChange={() => {}}
          handleGetLocation={() => {}}
        />
      )}
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

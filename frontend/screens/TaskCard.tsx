import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Button } from "react-native";

import useStore, {
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  Task,
} from "../store/useStore";
import { COLORS } from "../constants/colors";
import MapSelector from "./MapSelector";

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
  task: Task;
  isMiniMapVisible: boolean;
  handleInitTaskRequest: (param: number) => void;
  isConnected: boolean;
};

export default function TaskCard({
  task,
  isMiniMapVisible,
  handleInitTaskRequest,
  isConnected,
}: TaskCardProps) {
  const [showMiniMap, setShowMiniMap] = useState(false);
  useEffect(() => {
    return () => {
      //setCurrentTempTaskId(null);
      //setCurrentTaskId(null);
    };
  }, []);

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
      {showMiniMap && (
        <Text style={styles.helperText}>
          To enlarge the map, simply double-tap it.
        </Text>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Button
          disabled={!isConnected}
          title={showMiniMap ? "Hide Location" : "View Location"}
          color={isConnected ? undefined : "#B0B0B0"}
          onPress={() => setShowMiniMap((show) => !show)}
        />

        <Button
          title="Initiate"
          disabled={!isConnected}
          onPress={() => handleInitTaskRequest(task.id)}
          color={isConnected ? undefined : "#B0B0B0"}
        />
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
  helperText: {
    color: COLORS.color32,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
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

import React from "react";
import { View, Text, StyleSheet, Dimensions, Button } from "react-native";
import { URGENCY_OPTIONS, STATUS_OPTIONS } from "../store/useStore";

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
};

export default function TaskCard({ item }: TaskCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View
        style={{
          display: "flex",
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
                color: statusColorMap[item.status] || "#444",
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
            {item.category == "repair"
              ? "Fix & Repair"
              : item.category == "personal_help"
                ? "Personal Help"
                : item.category == "delivery"
                  ? "Move & Deliver"
                  : item.category == "other"
                    ? "Other"
                    : item.category}
          </Text>
          <Text style={styles.infoText}>
            Urgency:
            <Text style={{ color: urgencyColorMap[item.urgency] || "#444" }}>
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

      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button title="View Location" onPress={() => {}} />
        <Button title="Accept" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    width: width - 32,
    alignSelf: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: "#333",
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    //justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  centeredRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 8,
  },
  centeredText: {
    textAlign: "center",
    maxWidth: "90%",
  },
  infoText: {
    fontSize: 13,
    color: "#444",
  },
});

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

import { URGENCY_OPTIONS, STATUS_OPTIONS } from "../store/useStore";
import { Button } from "react-native";

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

type JobCardProps = {
  item: {
    id: number | string;
    title: string;
    description?: string;
    budget: number;
    urgency: string;
    location: string;
    status: string;
  };
};

export default function JobCard({ item }: JobCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.infoText}>
            Budget: ${Number(item.budget).toFixed(2)}
          </Text>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Text style={styles.infoText}>Urgency: </Text>
            <Text
              style={[
                styles.infoText,
                { color: urgencyColorMap[item.urgency] || "#444" },
              ]}
            >
              {item.urgency}
            </Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.infoText}>Location: {item.location}</Text>
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.infoText}>Status: </Text>
            <Text
              style={[
                styles.infoText,
                {
                  color:
                    STATUS_OPTIONS.find(
                      (status) => status.value === item.status,
                    )?.color || "#444",
                  fontWeight: "600",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      <Button title="Approximate Location" />
      <Button title="Accept" />
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
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  column: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#444",
    marginVertical: 2,
  },
});

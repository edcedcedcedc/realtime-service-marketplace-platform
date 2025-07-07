// components/JobSearchBar.tsx
import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { SPACING } from "../utils/spacings";

export default function JobSearchBar({
  value,
  onChangeText,
  placeholder = "Search tasks...",
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#999"
        selectionColor="#388E3C"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

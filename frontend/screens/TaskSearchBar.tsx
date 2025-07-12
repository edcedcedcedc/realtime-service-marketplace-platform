import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

import { SPACING } from "../constants/dimensions";
import { COLORS } from "../constants/colors";
import useStore from "../store/useStore";
import { Task } from "../store/useStore";

export default function TaskSearchBar({
  value,
  onChangeText,
  placeholder = "Search tasks...",
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const tasks = useStore((state) => state.tasks);

  const isEditable = (tasks: Task[]) => (tasks.length === 0 ? false : true);

  return (
    <View style={styles.container}>
      <TextInput
        editable={isEditable(tasks)}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor={COLORS.color25}
        selectionColor={COLORS.color3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
    width: "100%",
  },
  input: {
    backgroundColor: COLORS.color31,
    borderColor: COLORS.color18,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.color11,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});

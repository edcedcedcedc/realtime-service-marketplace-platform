import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import useStore from "../store/useStore";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const urgencyOptions = [
  { label: "Now", value: "now", color: "#d32f2f" }, // red
  { label: "Soon", value: "soon", color: "#fbc02d" }, // yellow
  { label: "Flexible", value: "flexible", color: "#388e3c" }, // green
];

export default function JobPostScreen({ navigation }: any) {
  const setTempJobData = useStore((state) => state.setTempJobData);
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      location: "",
      urgency: "now",
    },
  });

  const urgency = watch("urgency");

  const onSubmit = (data: any) => {
    setTempJobData(data);
    navigation.navigate("SearchScreen");
  };
  const logout = () => navigation.replace("Start");

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraHeight={0}
      extraScrollHeight={30}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%" }}>
          <Text style={styles.heading}>What do you need?</Text>

          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Job Title"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {/* Description - multiline */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description (tell us more)"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />

          {/* Budget */}
          <Controller
            control={control}
            name="budget"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Budget"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
              />
            )}
          />

          {/* Location */}
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {/* Urgency selector */}
          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyContainer}>
            {urgencyOptions.map(({ label, value, color }) => {
              const selected = urgency === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.urgencyButton,
                    { borderColor: color },
                    selected && { backgroundColor: color },
                  ]}
                  onPress={() => setValue("urgency", value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.urgencyText,
                      selected && { color: "white", fontWeight: "700" },
                      !selected && { color: color },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.searchButtonText}>Find Worker Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={logout}>
            <Text style={styles.searchButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#222",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#212121",
  },
  descriptionInput: {
    height: 100, // taller for multiline
    paddingTop: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  urgencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  urgencyButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
  },
  urgencyText: {
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#2962FF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

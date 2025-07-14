import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";
import { SPACING } from "../constants/dimensions";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export interface Profile {
  name: string;
  familyName: string;
  username: string;
  rating: number;
  tasksDone: number;
  specialization: string[]; // e.g., ["repair", "other: plumbing"]
  bio: string;
  eta: string;
}

export default function ProfileScreen() {
  const [isEditable, setIsEditable] = useState(false);

  const [name, setName] = useState("John");
  const [familyName, setFamilyName] = useState("Doe");
  const [username, setUsername] = useState("johndoe123");
  const [rating] = useState(4.5);
  const [tasksDone, setTasksDone] = useState("87");

  const [specialization, setSpecialization] = useState<string[]>(["repair"]);
  const [otherSpec, setOtherSpec] = useState("");

  const [bio, setBio] = useState(
    "Experienced handyman with 5+ years fixing everything from appliances to plumbing."
  );
  const [eta, setEta] = useState("10-15 min");

  const specs = ["repair", "personal help", "delivery", "other"];

  const isSpecSelected = (spec: string) => specialization.includes(spec);

  const toggleSpec = (spec: string) => {
    if (!isEditable) return;
    if (specialization.includes(spec)) {
      setSpecialization(specialization.filter((s) => s !== spec));
      if (spec === "other") setOtherSpec("");
    } else {
      setSpecialization([...specialization, spec]);
    }
  };

  const buildProfileData = (): Profile => {
    const specsWithOther = specialization.map((spec) =>
      spec === "other" && otherSpec.trim() ? `other: ${otherSpec.trim()}` : spec
    );

    return {
      name,
      familyName,
      username,
      rating,
      tasksDone: parseInt(tasksDone, 10),
      specialization: specsWithOther,
      bio,
      eta,
    };
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraHeight={300}
        keyboardOpeningTime={250}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Account Info</Text>
          <TouchableOpacity
            onPress={() => {
              if (isEditable) {
                const profile = buildProfileData();
                console.log("💾 Profile Data:", profile);
              }
              setIsEditable((prev) => !prev);
            }}
          >
            <Text style={styles.editButtonText}>
              {isEditable ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <EditableField
            label="Name"
            value={name}
            onChange={setName}
            editable={isEditable}
          />
          <EditableField
            label="Family Name"
            value={familyName}
            onChange={setFamilyName}
            editable={isEditable}
          />
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.staticValue}>{username}</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Rating</Text>
            <Text style={styles.staticValue}>{rating}</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Tasks Done</Text>
            <Text style={styles.staticValue}>{tasksDone}</Text>
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Specializations</Text>
            <View style={styles.categoryContainer}>
              {specs.map((spec) => {
                const selected = isSpecSelected(spec);
                return (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => toggleSpec(spec)}
                    style={[
                      styles.categoryButton,
                      selected && styles.categoryButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}
                    >
                      {spec.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {isEditable && isSpecSelected("other") && (
              <EditableField
                label="What else you could do"
                placeholder="e.g excellent at cleaning"
                value={otherSpec}
                onChange={setOtherSpec}
                editable={true}
              />
            )}
          </View>

          <EditableField
            label="ETA"
            value={eta}
            onChange={setEta}
            placeholder="Estimated Time of Arrival"
            editable={isEditable}
          />
          <EditableField
            label="About Tasker"
            value={bio}
            onChange={setBio}
            multiline
            editable={isEditable}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  editable: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
};

const EditableField = ({
  label,
  value,
  onChange,
  editable,
  multiline = false,
  keyboardType = "default",
  placeholder,
}: FieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        !editable && styles.readOnlyInput,
        multiline && styles.multilineInput,
      ]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      editable={editable}
      placeholder={placeholder || label}
      placeholderTextColor={COLORS.color25}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.color27,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  editButtonText: {
    fontSize: 16,
    color: COLORS.color16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: COLORS.color15,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: COLORS.color27,
    backgroundColor: COLORS.color19,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.color26,
  },
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryButton: {
    backgroundColor: COLORS.color31,
    borderColor: COLORS.color30,
    borderRadius: 6,
    borderWidth: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButtonSelected: {
    backgroundColor: COLORS.color16,
    borderColor: COLORS.color16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  categoryText: {
    color: COLORS.color11,
    fontSize: 14,
  },
  categoryTextSelected: {
    color: COLORS.color19,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  staticValue: {
    fontSize: 16,
    color: COLORS.color27,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.color26,
  },
  scrollContent: {
    alignItems: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
});

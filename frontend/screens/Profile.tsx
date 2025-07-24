import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import Toast from "react-native-toast-message";

import api from "../services/api";
import useStore, { Category } from "../store/useStore";
import { COLORS } from "../constants/colors";
import { SPACING } from "../constants/dimensions";
import { withTimeout } from "../utils/withTimeout";
import { ProfileType } from "../store/useStore";

const profileSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  family_name: Yup.string().required("Family name is required"),
  eta: Yup.number()
    .transform((value, originalValue) =>
      originalValue === "" || isNaN(originalValue)
        ? undefined
        : Number(originalValue)
    )
    .max(100, "ETA must be at most 2 digits (minutes)")
    .typeError("ETA must be a number"),
  bio: Yup.string()
    .max(128, "Bio must be at most 128 characters")
    .matches(/^[^\d]*$/, "About Tasker cannot contain digits"),
  category: Yup.string()
    .oneOf(
      ["repair", "personal_help", "delivery", "other"],
      "Select a valid category"
    )
    .when("role", {
      is: "tasker",
      then: (schema) => schema.required("Category is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export default function Profile() {
  const profile = useStore((state) => state.profile);
  const setProfile = useStore().setProfile;
  const setLoading = useStore().setLoading;
  const [isEditable, setIsEditable] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: "",
      family_name: "",
      eta: 0,
      bio: "",
    },
  });

  const watchAll = watch();
  useEffect(() => {
    console.log("Form State:", watchAll);
  }, [watchAll]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await withTimeout(api.get("/profile/"));
      console.log(response.data);

      setProfile(response.data);

      setValue("name", response.data.name || "");
      setValue("family_name", response.data.family_name || "");
      setValue("bio", response.data.bio || "");

      if (response.data.user.role == "tasker") {
        setValue("eta", response.data.eta);
        setValue("category", response.data.category || "");
      }

      Toast.show({
        type: "success",
        text1: "Profile fetched",
        text2: JSON.stringify(response.data),
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Cannot fetch profile",
        text2: err.response?.data?.error || "Check your internet connection",
      });
    } finally {
      setLoading(false);
    }
  };

  const patchProfile = async (formData: ProfileType) => {
    try {
      setLoading(true);
      const patchData = {
        ...formData,
        eta: Number(formData.eta),
        category: formData.category,
      };
      console.log(patchData, "patchData", formData, "formData");
      const response = await withTimeout(api.patch("/profile/", patchData));
      console.log(response.data, "respone data from patch");

      setProfile(response.data);

      setValue("name", response.data.name || "");
      setValue("family_name", response.data.family_name || "");
      setValue("bio", response.data.bio || "");

      if (response.data.user.role === "tasker") {
        setValue("eta", Number(response.data.eta));
        setValue("category", response.data.category || "");
      }

      Toast.show({
        type: "success",
        text1: "Profile Patched",
        text2: JSON.stringify(response.data),
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update profile",
        text2: err.response?.data?.error || "Check your internet connection",
      });
    } finally {
      setIsEditable(false);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (isEditable) {
      const wrapped = handleSubmit((data: any) => {
        patchProfile(data);
      });
      wrapped();
    } else {
      setIsEditable(true);
    }
  };

  const categories: Category[] = [
    "repair",
    "personal_help",
    "delivery",
    "other",
  ];

  const toggleCategory = async (cat: Category) => {
    if (!isEditable) return;
    setProfile({ ...profile, category: cat });
    setValue("category", cat, { shouldValidate: true, shouldDirty: true });
    await trigger("category");
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
        <View style={{ marginBottom: SPACING.md }}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.heading}>Account Info</Text>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={styles.editButtonText}>
                {isEditable ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <StaticField label="ID" value={profile.user.id} />
          <StaticField label="Username" value={profile.user.username} />
          <StaticField label="Email" value={profile.user.email} />
          <StaticField label="Role" value={profile.user.role} />
          <StaticField label="Rating" value={profile.rating} />
          {profile.user.role === "tasker" ? (
            <>
              <StaticField label="Tasks Done" value={profile.tasks_done!} />
            </>
          ) : (
            <>
              <StaticField label="Tasks Posted" value={profile.tasks_posted!} />
            </>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <EditableField
                label="Name"
                value={value}
                onChange={(value) => {
                  setProfile({ ...profile, name: value });
                  onChange(value);
                }}
                editable={isEditable}
                error={errors.name?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="family_name"
            render={({ field: { onChange, value } }) => (
              <EditableField
                label="Family Name"
                value={value}
                onChange={(value) => {
                  setProfile({ ...profile, family_name: value });
                  onChange(value);
                }}
                editable={isEditable}
                error={errors.family_name?.message}
              />
            )}
          />

          {profile.user.role === "tasker" && (
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <View style={styles.fieldContainer}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => {
                      const selected = field.value === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          onPress={() => toggleCategory(cat)}
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
                            {cat.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {!!errors.category && (
                    <Text style={styles.errorText}>
                      {errors.category.message}
                    </Text>
                  )}
                </View>
              )}
            />
          )}

          {profile.user.role === "tasker" && (
            <Controller
              control={control}
              name="eta"
              render={({ field: { onChange, value } }) => (
                <EditableField
                  label="ETA"
                  value={value?.toString()!}
                  onChange={(value) => {
                    setProfile({ ...profile, eta: Number(value) });
                    onChange(value);
                  }}
                  editable={isEditable}
                  placeholder="Estimated time of arrival in minutes"
                  error={errors.eta?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, value } }) => (
              <EditableField
                label="About Me"
                placeholder="More information regarding your skills "
                value={value || ""}
                onChange={(value) => {
                  setProfile({ ...profile, bio: value });
                  onChange(value);
                }}
                editable={isEditable}
                multiline
                error={errors.bio?.message}
              />
            )}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const StaticField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.staticValue}>{value}</Text>
  </View>
);

const EditableField = ({
  label,
  value,
  onChange,
  editable,
  multiline = false,
  keyboardType = "default",
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  editable: boolean;
  multiline?: boolean;
  keyboardType?: "default" | "numeric";
  placeholder?: string;
  error?: string;
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        !editable && styles.readOnlyInput,
        multiline && styles.multilineInput,
        error && styles.inputError,
      ]}
      value={value}
      onChangeText={onChange}
      multiline={multiline}
      editable={editable}
      placeholder={placeholder || label}
      placeholderTextColor={COLORS.color25}
      keyboardType={keyboardType}
    />
    {!!error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    alignItems: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  input: {
    fontSize: 16,
    color: COLORS.color27,
    backgroundColor: COLORS.color19,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 50,
    alignContent: "center",
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.color26,
  },
  inputError: {
    borderColor: COLORS.color5,
  },
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
    paddingTop: 9,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.xs,
  },
  fieldContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: COLORS.color15,
    marginBottom: 6,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  readOnlyInput: {
    backgroundColor: "#f0f0f0",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  staticValue: {
    fontSize: 16,
    color: COLORS.color27,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 50,
    alignContent: "center",
    justifyContent: "center",
    textAlignVertical: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.color26,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
  categoryText: {
    color: COLORS.color11,
    fontSize: 14,
  },
  categoryTextSelected: {
    color: COLORS.color19,
    fontWeight: "bold",
  },
});

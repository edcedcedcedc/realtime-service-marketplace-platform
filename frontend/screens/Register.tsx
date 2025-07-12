import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Toast from "react-native-toast-message";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import useStore from "../store/useStore";
import { registerSchema } from "../validation/validationSchema";
import api from "../services/api";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../constants/dimensions";
import { COLORS } from "../constants/colors";

export default function RegisterScreen({ navigation }: any) {
  const { setAuth, setLoading } = useStore.getState();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Yup.InferType<typeof registerSchema>>({
    resolver: yupResolver(registerSchema),
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  useEffect(() => {
    return () => reset();
  }, []);

  const handleRegister = async (data: Yup.InferType<typeof registerSchema>) => {
    try {
      setLoading(true);
      const res = await withTimeout(
        api.post("/register/", {
          email: data.email,
          username: data.username,
          password: data.password,
          role: data.role,
        }),
      );
      useStore
        .getState()
        .setAuth(
          { access: res.data.access, refresh: res.data.refresh },
          res.data.user,
        );
      Toast.show({
        type: "success",
        text1: "Registration Successful",
      });
      navigation.replace(
        res.data.user.role === "client" ? "Search a tasker" : "Task feed",
      );
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2:
          err.response?.data?.error ||
          "Something got wrong, please check your internet connection",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraHeight={300}
        keyboardOpeningTime={250}
        scrollEventThrottle={250}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%" }}>
          <Text style={styles.title}>Create Account</Text>

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="Email"
                  value={value ? value : ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.color25}
                  selectionColor={COLORS.color3}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}
              </>
            )}
          />

          {/* Username */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Username"
                  value={value ? value : ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={COLORS.color25}
                  selectionColor={COLORS.color3}
                  autoComplete="off"
                  textContentType="name"
                  importantForAutofill="no"
                  enablesReturnKeyAutomatically
                />
                {errors.username && (
                  <Text style={styles.errorText}>
                    {errors.username.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholderTextColor={COLORS.color25}
                  selectionColor={COLORS.color3}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  placeholderTextColor={COLORS.color25}
                  selectionColor={COLORS.color3}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.roleLabel}>Pick one of</Text>
                <View style={styles.roleInlineContainer}>
                  {["client", "tasker"].map((role) => {
                    const selected = value === role;
                    return (
                      <TouchableOpacity
                        key={role}
                        onPress={() => onChange(role)}
                        activeOpacity={0.7}
                        style={styles.roleTextWrapper}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            selected && styles.roleTextSelected,
                          ]}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.role && (
                  <Text style={styles.errorText}>{errors.role.message}</Text>
                )}
              </View>
            )}
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={handleSubmit(handleRegister)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    elevation: 3,
    flex: 1,
    height: 50,
    justifyContent: "center",
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20.84,
  },
  buttonText: {
    color: COLORS.color19,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    width: "100%",
  },
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  errorText: {
    color: COLORS.color5,
    fontSize: 13,
    marginBottom: 12,
    marginTop: -12,
  },
  input: {
    backgroundColor: COLORS.color19,
    borderColor: COLORS.color26,
    borderRadius: 8,
    borderWidth: 1,
    color: COLORS.color27,
    elevation: 2,
    fontSize: 16,
    height: 50,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: COLORS.color21,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: "100%",
  },
  inputError: {
    borderColor: COLORS.color5,
  },
  registerButton: {
    backgroundColor: COLORS.color24,
  },
  roleInlineContainer: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center", // spacing between text items, if "gap" not supported use marginHorizontal
  },
  roleLabel: {
    color: COLORS.color15,
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
  },
  roleText: {
    borderBottomColor: "transparent",
    borderBottomWidth: 2,
    color: COLORS.color15,
    fontSize: 16,

    paddingBottom: 10,
  },
  roleTextSelected: {
    color: COLORS.color29, // your primary highlight color
  },
  roleTextWrapper: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleToggleButton: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    height: 50,
    justifyContent: "center",
  },
  roleToggleButtonSelectedClient: {
    backgroundColor: COLORS.color24, // Orange 800
    borderColor: COLORS.color24,
  },
  roleToggleButtonSelectedWorker: {
    backgroundColor: COLORS.color24, // Deep Purple 700 "#512DA8"
    borderColor: COLORS.color24,
  },
  roleToggleButtonUnselected: {
    backgroundColor: COLORS.color19,
    borderColor: COLORS.color26,
  },
  roleToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  roleToggleText: {
    color: COLORS.color27,
    fontSize: 16,
    fontWeight: "600",
  },
  roleToggleTextSelected: {
    color: COLORS.color19,
  },
  scrollContent: {
    alignItems: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  title: {
    color: COLORS.color27,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },
});

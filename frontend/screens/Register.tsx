import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore from "../store/useStore";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation/validationSchema";
import * as Yup from "yup";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../utils/spacings";

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
        })
      );
      useStore
        .getState()
        .setAuth(
          { access: res.data.access, refresh: res.data.refresh },
          res.data.user
        );
      Toast.show({
        type: "success",
        text1: "Registration Successful",
      });
      navigation.replace(
        res.data.user.role === "client" ? "Search a tasker" : "Task feed"
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
                  placeholderTextColor="#999"
                  selectionColor="#388E3C"
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
                  placeholderTextColor="#999"
                  selectionColor="#388E3C"
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
                  placeholderTextColor="#999"
                  selectionColor="#388E3C"
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
                  placeholderTextColor="#999"
                  selectionColor="#388E3C"
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
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    color: "#212121",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#212121",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#D32F2F",
    marginTop: -12,
    marginBottom: 12,
    fontSize: 13,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: 24,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20.84,
  },
  registerButton: {
    backgroundColor: "#FF6F00",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 10,
    color: "#666",
  },
  roleToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  roleToggleButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  roleToggleButtonSelectedClient: {
    backgroundColor: "#FF6F00", // Orange 800
    borderColor: "#FF6F00",
  },
  roleToggleButtonSelectedWorker: {
    backgroundColor: "#FF6F00", // Deep Purple 700 "#512DA8"
    borderColor: "#FF6F00",
  },
  roleToggleButtonUnselected: {
    backgroundColor: "#fff",
    borderColor: "#BDBDBD",
  },
  roleToggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  roleToggleTextSelected: {
    color: "#fff",
  },
  roleInlineContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24, // spacing between text items, if "gap" not supported use marginHorizontal
  },
  roleTextWrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  roleText: {
    fontSize: 16,
    color: "#666",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",

    paddingBottom: 10,
  },
  roleTextSelected: {
    color: "#cb5d0e", // your primary highlight color
  },
});

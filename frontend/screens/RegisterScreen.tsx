import React from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../services/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RadioButton } from "react-native-paper";
import useStore from "../store/useStore";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation/validationSchema";
import * as Yup from "yup";

export default function RegisterScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Yup.InferType<typeof registerSchema>>({
    resolver: yupResolver(registerSchema),
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      role: "client",
    },
  });

  const handleRegister = async (data: Yup.InferType<typeof registerSchema>) => {
    try {
      const res = await api.post("/register/", {
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role,
      });
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
      navigation.replace("Home");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: err.response.data.error,
      });
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                  value={value}
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                  selectionColor="#388E3C"
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

          {/* Role */}
          <Controller
            control={control}
            name="role"
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={styles.roleLabel}>Register as:</Text>
                <RadioButton.Group onValueChange={onChange} value={value}>
                  <RadioButton.Item label="Client" value="client" />
                  <RadioButton.Item label="Worker" value="worker" />
                </RadioButton.Group>
                {errors.role && (
                  <Text style={styles.errorText}>{errors.role.message}</Text>
                )}
              </>
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
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
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
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
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
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 20.84,
  },
  registerButton: {
    backgroundColor: "#388E3C",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#212121",
  },
});

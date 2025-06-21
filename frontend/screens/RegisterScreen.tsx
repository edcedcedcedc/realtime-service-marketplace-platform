import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import api from "../services/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { RadioButton } from "react-native-paper";
import useStore from "../store/useStore";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation/validationSchema";
import * as Yup from "yup";
import { StackActions } from "@react-navigation/native";

export default function RegisterScreen({ navigation }: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
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
      navigation.replace("Home");
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        JSON.stringify(err.response?.data || err.message)
      );
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
        <View>
          <Text style={styles.title}>Create Account</Text>

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.email && (
                  <Text style={{ color: "red", marginBottom: 10 }}>
                    {errors.email.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Username */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.username && (
                  <Text style={{ color: "red", marginBottom: 10 }}>
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
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                />
                {errors.password && (
                  <Text style={{ color: "red", marginBottom: 10 }}>
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
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                />
                {errors.confirmPassword && (
                  <Text style={{ color: "red", marginBottom: 10 }}>
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
                <Text>Register as:</Text>
                <RadioButton.Group onValueChange={onChange} value={value}>
                  <RadioButton.Item label="Client" value="client" />
                  <RadioButton.Item label="Worker" value="worker" />
                </RadioButton.Group>
                {errors.role && (
                  <Text style={{ color: "red", marginBottom: 10 }}>
                    {errors.role.message}
                  </Text>
                )}
              </>
            )}
          />

          <View style={styles.buttonsContainer}>
            <Button title="Register" onPress={handleSubmit(handleRegister)} />
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
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
});

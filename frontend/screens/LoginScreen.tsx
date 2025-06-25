import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import api from "../services/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore from "../store/useStore";
import { loginSchema } from "../validation/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Toast from "react-native-toast-message";

export default function LoginScreen({ navigation }: any) {
  const auth = useStore((state) => state.auth);
  const scrollRef = useRef<any>(null);
  const { setAuth, setLoading } = useStore.getState();
  useEffect(() => {
    console.log("Auth state changed:", auth);
  }, [auth]);

  useEffect(() => {
    console.log("Login Mounted");
    return () => {
      console.log("Login Unmounted");
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    reValidateMode: "onChange",
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (data: { username: string; password: string }) => {
    console.log("Form data:", data);
    try {
      setLoading(true);
      const res = await api.post("/login/", {
        username: data.username,
        password: data.password,
      });
      const jwt = { access: res.data.access, refresh: res.data.refresh };
      const user = res.data.user;
      setAuth(jwt, user);
      Toast.show({
        type: "success",
        text1: "Login Successful",
        /*  text2: "Welcome back!", */
      });
      navigation.replace("Jobsfeed");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          err.response?.data?.error ||
          "Please check your username and password and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Image source={require("../assets/icon.png")} style={styles.logo} />
          <Text style={styles.title}>Your App Name</Text>

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
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#999"
                  selectionColor="#2962FF"
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
                  secureTextEntry
                  placeholderTextColor="#999"
                  selectionColor="#2962FF"
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </>
            )}
          />

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.loginButton]}
              onPress={handleSubmit(handleLogin)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            {/*  <TouchableOpacity
              style={[styles.button, styles.registerButton]}
              onPress={() => navigation.navigate("Register")}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity> */}
          </View>

          {/* Terms */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Terms and Conditions", "Display your terms here")
            }
            style={{ alignSelf: "center", marginTop: 10 }}
          >
            <Text style={styles.terms}>Terms and Conditions</Text>
          </TouchableOpacity>
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    alignSelf: "center",
    resizeMode: "contain",
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
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
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
    shadowRadius: 3.84,
  },
  loginButton: {
    backgroundColor: "#2962FF",
  },
  registerButton: {
    backgroundColor: "#388E3C",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  terms: {
    fontSize: 12,
    color: "#757575",
    textDecorationLine: "underline",
  },
});

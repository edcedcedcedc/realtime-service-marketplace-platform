import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Toast from "react-native-toast-message";
import { yupResolver } from "@hookform/resolvers/yup";

import api from "../services/api";
import useStore from "../store/useStore";
import { loginSchema } from "../validation/validationSchema";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../constants/dimensions";
import { COLORS } from "../constants/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TermsAndConditions from "./TermsAndConditions";

export default function LoginScreen({ navigation }: any) {
  const { setAuth, setLoading, setIsLoggedIn } = useStore.getState();
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  useEffect(() => {
    setIsLoggedIn(false);
    scrollRef.current?.scrollToPosition(0, 0, false);
    return () => {
      Keyboard.dismiss();
      scrollRef.current?.scrollToPosition(0, 0, false);
      reset();
    };
  }, []);

  const {
    control,
    handleSubmit,
    reset,
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
    try {
      setLoading(true);
      const res = await withTimeout(
        api.post("/login/", {
          username: data.username,
          password: data.password,
        }),
        5000,
        "Request timed out. Please try again"
      );

      const jwt = { access: res.data.access, refresh: res.data.refresh };
      const user = res.data.user;
      setAuth(jwt, user);
      setLoading(false);
      setIsLoggedIn(true);
      setModalVisible(true);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          err.response?.data?.error ||
          "Please check your credentials and internet connection",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        extraHeight={250}
        keyboardOpeningTime={10000}
        scrollEventThrottle={250}
        showsVerticalScrollIndicator={false}
      >
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.title}>Taskoon</Text>

        {/* Username */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                ref={usernameRef}
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Username"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={COLORS.color25}
                selectionColor={COLORS.color16}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
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
                ref={passwordRef}
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                placeholderTextColor={COLORS.color25}
                selectionColor={COLORS.color16}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
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
        </View>
        {isLoggedIn && (
          <TermsAndConditions
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            handleLogin={handleLogin}
            navigation={navigation}
          />
        )}
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
    shadowRadius: 3.84,
  },
  buttonText: {
    color: COLORS.color19,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
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
  loginButton: {
    backgroundColor: COLORS.color16,
  },
  logo: {
    alignSelf: "center",
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
    width: 100,
  },
  scrollContent: {
    alignItems: "stretch",
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: SPACING.md,
  },
  terms: {
    color: COLORS.color28,
    fontSize: 12,
    textDecorationLine: "underline",
  },
  title: {
    color: COLORS.color27,
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
  },
});

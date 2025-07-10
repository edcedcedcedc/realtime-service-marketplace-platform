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
import api from "../services/api";
import useStore from "../store/useStore";
import { loginSchema } from "../validation/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Toast from "react-native-toast-message";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../utils/spacings";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import TermsAndConditions from "./TermsAndConditions";

export default function LoginScreen({ navigation }: any) {
  const auth = useStore((state) => state.auth);
  const { setAuth, setLoading } = useStore.getState();
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  /*  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{
    username: string;
    password: string;
  } | null>(null); */

  useEffect(() => {
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
                placeholderTextColor="#999"
                selectionColor="#2962FF"
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
                placeholderTextColor="#999"
                selectionColor="#2962FF"
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
        <TermsAndConditions
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          handleLogin={handleLogin}
          navigation={navigation}
        />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: SPACING.md,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "stretch",
    paddingVertical: SPACING.md,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButton: {
    backgroundColor: "#2962FF",
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

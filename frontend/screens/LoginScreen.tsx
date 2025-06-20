import React, { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import api from "../services/api";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import useStore from "../store/useStore";
import { loginSchema } from "../validation/validationSchema";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

export default function LoginScreen({ navigation }: any) {
  const auth = useStore((state) => state.auth);

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
    const { setAuth } = useStore.getState();
    console.log("Form data:", data);
    try {
      const res = await api.post("/login/", {
        username: data.username,
        password: data.password,
      });
      const jwt = { access: res.data.access, refresh: res.data.refresh };
      const user = res.data.user;
      setAuth(jwt, user);
      navigation.navigate("Home");
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
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
          <Image source={require("../assets/icon.png")} style={styles.logo} />
          <Text style={styles.title}>Your App Name</Text>

          {/* Username Field */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => {
              return (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {errors.username && (
                    <Text style={{ color: "red", marginBottom: 10 }}>
                      {errors.username.message}
                    </Text>
                  )}
                </>
              );
            }}
          />

          {/* Password Field */}
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

          <View style={styles.buttonsContainer}>
            <Button title="Login" onPress={handleSubmit(handleLogin)} />
            <View style={{ width: 10 }} />
            <Button
              title="Register"
              onPress={() => navigation.navigate("Register")}
            />
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Terms and Conditions", "Display your terms here")
            }
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
  terms: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    textDecorationLine: "underline",
  },
});

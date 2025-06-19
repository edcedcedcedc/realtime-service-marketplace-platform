import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/login/", {
        username,
        password,
      });
      await AsyncStorage.setItem("access", res.data.access);
      await AsyncStorage.setItem("refresh", res.data.refresh);
      navigation.navigate("Home");
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        JSON.stringify(err.response?.data || err.message),
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
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.buttonsContainer}>
            <Button title="Login" onPress={handleLogin} />
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

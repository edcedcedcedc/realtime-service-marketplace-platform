import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const res = await api.post("/register/", {
        username,
        password,
      });
      await AsyncStorage.setItem("access", res.data.access);
      await AsyncStorage.setItem("refresh", res.data.refresh);
      Alert.alert("Success", "You can now log in.");
      navigation.navigate("Home");
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert(
        "Register Failed",
        JSON.stringify(err.response?.data || err.message),
      );
    }
  };

  return (
    <View>
      <Text>username:</Text>
      <TextInput value={username} onChangeText={setUsername} />
      <Text>Password:</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";

export default function HomeScreen({ navigation }: any) {
  const logout = async () => {
    navigation.replace("Login");
  };
  useEffect(() => {
    console.log("Register Mounted");
    return () => {
      console.log("Register Unmounted");
    };
  }, []);

  return (
    <View>
      <Text>Welcome to the Job Board</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

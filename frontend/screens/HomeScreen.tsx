import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import useStore from "../store/useStore";

export default function HomeScreen({ navigation }: any) {
  const auth = useStore((state) => state.auth);

  useEffect(() => {
    console.log("Auth state changed:", auth);
  }, [auth]);

  const logout = async () => {
    navigation.replace("Start");
  };

  useEffect(() => {
    console.log("Home Mounted");
    return () => {
      console.log("Home Unmounted");
    };
  }, []);

  return (
    <View>
      <Text>Welcome to the Job Board</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}

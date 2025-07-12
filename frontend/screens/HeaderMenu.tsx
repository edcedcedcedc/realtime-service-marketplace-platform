// components/HeaderMenu.tsx
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Menu, Text } from "react-native-paper";
import { logout } from "../utils/logout";
import useStore from "../store/useStore";

interface HeaderMenuProps {
  navigation: any;
}

export default function HeaderMenu({ navigation }: HeaderMenuProps) {
  const [visible, setVisible] = useState(false);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  if (!isLoggedIn) {
    return;
  }
  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchor={
        <TouchableOpacity onPress={openMenu} style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>...</Text>
        </TouchableOpacity>
      }
    >
      <Menu.Item
        onPress={() => {
          closeMenu();
          console.log("Profile pressed");
          // navigation.navigate("ProfileScreen");
        }}
        title="Profile"
      />
      <Menu.Item
        onPress={() => {
          closeMenu();
          console.log("Settings pressed");
          // navigation.navigate("SettingsScreen");
        }}
        title="Settings"
      />
      <Menu.Item
        onPress={() => {
          closeMenu();
          logout();
        }}
        title="Logout"
      />
    </Menu>
  );
}

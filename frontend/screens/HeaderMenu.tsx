import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { Menu, Text } from "react-native-paper";

import { logout } from "../utils/logout";
import useStore from "../store/useStore";
import { COLORS } from "../constants/colors";

interface HeaderMenuProps {
  navigation: any;
}

export default function HeaderMenu({ navigation }: HeaderMenuProps) {
  const visible = useStore((s) => s.isHeaderMenuVisible);
  const setVisible = useStore((s) => s.setIsHeaderMenuVisible);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const setRefresh = useStore((state) => state.setRefresh);

  if (!isLoggedIn) {
    return;
  }

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={{ backgroundColor: COLORS.color38 }}
      anchor={<Anchor openMenu={openMenu} />}
    >
      <Menu.Item
        onPress={() => {
          closeMenu();
          navigation.navigate("Profile");
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
          setRefresh();
        }}
        title="Refresh"
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

function Anchor({ openMenu }: any) {
  return (
    <TouchableOpacity onPress={openMenu} style={{ paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>...</Text>
    </TouchableOpacity>
  );
}

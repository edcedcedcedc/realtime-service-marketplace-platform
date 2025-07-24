import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Menu, Text } from "react-native-paper";

import { logout } from "../utils/logout";
import useStore from "../store/useStore";
import { COLORS } from "../constants/colors";
import { manuallyCheckConnection } from "../utils/netInfo";

interface HeaderMenuProps {
  navigation: any;
}

export default function HeaderMenu({ navigation }: HeaderMenuProps) {
  const [visible, setVisible] = useState(false);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  const setRefreshTaskRequestSocket = useStore().setRefreshTaskRequestSocket;
  const setRefreshTaskFeedocket = useStore().setRefreshTaskFeedSocket;
  const isConnected = useStore((state) => state.isConnected);
  const setIsLoggedIn = useStore().setIsLoggedIn;
  if (!isLoggedIn) return null;

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      contentStyle={{ backgroundColor: COLORS.color38 }}
      anchor={
        <TouchableOpacity onPress={openMenu} style={styles.anchor}>
          <Text style={styles.menuTrigger}>...</Text>
        </TouchableOpacity>
      }
    >
      <View style={styles.networkContainer}>
        <Text style={styles.networkLabel}>Network </Text>
        <Text
          style={[
            styles.networkStatus,
            { color: isConnected ? COLORS.color3 : COLORS.color7 },
          ]}
        >
          {isConnected ? "Online" : "Offline"}
        </Text>
      </View>

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
          setRefreshTaskFeedocket();
          setRefreshTaskRequestSocket();
          if (isLoggedIn) {
            manuallyCheckConnection();
          }
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

const styles = StyleSheet.create({
  anchor: {
    paddingHorizontal: 16,
  },
  menuTrigger: {
    fontSize: 24,
    fontWeight: "bold",
  },
  networkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  networkLabel: {
    fontSize: 15,
    color: COLORS.color14,
  },
  networkStatus: {
    fontSize: 15,
  },
});

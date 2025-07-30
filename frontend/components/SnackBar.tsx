// components/ConnectionSnackbar.tsx
import { Snackbar } from "react-native-paper";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import useStore from "../store/useStore";

export default function ConnectionSnackbar() {
  const isConnected = useStore((state) => state.isConnected);
  const setIsConnected = useStore((state) => state.setIsConnected);
  const snackbarVisible = useStore((state) => state.snackbarVisible);
  const setSnackbarVisible = useStore().setSnackbarVisible;

  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      setIsConnected(connected);
      setSnackbarMessage(connected ? "You are online" : "You are offline");
      setSnackbarVisible(true);
    });

    return () => unsubscribe();
  }, [setIsConnected]);

  return (
    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={1300}
      style={{
        backgroundColor: isConnected ? "#388E3C" : "#D32F2F",
        elevation: 1000,
      }}
    >
      {snackbarMessage}
    </Snackbar>
  );
}

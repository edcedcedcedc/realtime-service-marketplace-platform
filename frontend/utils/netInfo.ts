import NetInfo from "@react-native-community/netinfo";
import useStore from "../store/useStore"; // adjust path if needed

export async function manuallyCheckConnection() {
  const setIsConnected = useStore.getState().setIsConnected;
  const setSnackbarVisible = useStore.getState().setSnackbarVisible;

  try {
    const state = await NetInfo.fetch();
    const connected = state.isConnected ?? false;
    setIsConnected(connected);
    setSnackbarVisible(true);
    console.log(`[ManualCheck] Network is ${connected ? "Online" : "Offline"}`);
  } catch (err) {
    console.error("Failed to fetch NetInfo:", err);
  }
}

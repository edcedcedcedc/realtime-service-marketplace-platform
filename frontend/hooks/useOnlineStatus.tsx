import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import useStore from "../store/useStore";

export function useOnlineStatus() {
  const setIsOnline = useStore((s) => s.setIsOnline);

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      console.log("[NetInfo] initial:", state);
      const online = state.isInternetReachable ?? state.isConnected ?? false;
      setIsOnline(Boolean(online));
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log("[NetInfo] event:", state);
      const online = state.isInternetReachable ?? state.isConnected ?? false;
      setIsOnline(Boolean(online));
    });

    return () => unsubscribe();
  }, [setIsOnline]);
}

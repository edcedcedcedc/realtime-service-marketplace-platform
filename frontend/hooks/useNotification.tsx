import { useEffect } from "react";
import { SocketManager } from "../utils/socketManager";
import { useNetwork } from "./useNetwork";
import useStore from "../store/useStore";

const notificationSocket = new SocketManager();
export function useSocketNotifications() {
  const { wsTaskNotificationsUrl } = useNetwork();
  const addNotification = useStore((s) => s.addNotification);

  useEffect(() => {
    notificationSocket.connect(wsTaskNotificationsUrl, "notifications");

    notificationSocket.on("taskrequest:acceptedbyclient", (payload) => {
      addNotification(payload);
    });

    notificationSocket.on("taskrequest:cancelledbyclient", (payload) => {
      addNotification(payload);
    });

    notificationSocket.on("taskrequest:autocancelledbyclient", (payload) => {
      addNotification(payload);
    });

    return () => {
      notificationSocket.disconnect();
      notificationSocket.off("taskrequest:acceptedbyclient", (payload) => {});
      notificationSocket.off("taskrequest:cancelledbyclient", (payload) => {});
    };
  }, [wsTaskNotificationsUrl]);

  return notificationSocket;
}

import Constants from "expo-constants";
import useStore from "../store/useStore";

const IPV4 = Constants.expoConfig!.extra!.IPV4;
export const HTTP_BASE_URL = `http://${IPV4}:8000/api/`;
const WS_TASKFEED_URL = `ws://${IPV4}:8000/ws/taskfeed/`;
const WS_TASKREQUEST_URL = `ws://${IPV4}:8000/ws/taskrequests/`;
const WS_NOTIFICATION_URL = `ws://${IPV4}:8000/ws/notifications/`;

export function useNetwork() {
  const access = useStore((state) => state.auth.jwt?.access);

  let wsTaskFeedUrl = `${WS_TASKFEED_URL}?token=${encodeURIComponent(access!)}`;
  let wsTaskNotificationsUrl = `${WS_NOTIFICATION_URL}?token=${encodeURIComponent(access!)}`;

  function getTaskRequestUrl(id: string | number, count: number) {
    if (!access) {
      if (count == 5) {
        return null;
      }
      setTimeout(() => {
        getTaskRequestUrl(id, count + 1);
      }, 3000);
    } else {
      return `${WS_TASKREQUEST_URL}${id}/?token=${encodeURIComponent(access)}` as string;
    }
  }

  return { wsTaskFeedUrl, getTaskRequestUrl, wsTaskNotificationsUrl };
}

import useStore from "../store/useStore";
import { useEffect, useState } from "react";
import { ensureValidAccessToken } from "../utils/ensureValidAccessToken";

import {
  WS_NOTIFICATION_URL,
  WS_TASKFEED_URL,
  WS_TASKREQUEST_URL,
} from "../utils/network";

export function useNetwork() {
  const [wsTaskFeedUrl, setWsTaskFeedUrl] = useState<string | null>(null);
  const [wsTaskNotificationsUrl, setWsTaskNotificationsUrl] = useState<
    string | null
  >(null);

  const access = useStore((state) => state.auth.jwt?.access);

  useEffect(() => {
    (async () => {
      const access = await ensureValidAccessToken();
      if (access) {
        setWsTaskFeedUrl(
          `${WS_TASKFEED_URL}?token=${encodeURIComponent(access)}`
        );
        setWsTaskNotificationsUrl(
          `${WS_NOTIFICATION_URL}?token=${encodeURIComponent(access)}`
        );
      }
    })();
  }, []);

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

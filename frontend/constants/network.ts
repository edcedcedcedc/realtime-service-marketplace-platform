import Constants from "expo-constants";

export const IPV4 = Constants.expoConfig!.extra!.IPV4;
export const HTTP_BASE_URL = `http://${IPV4}:8000/api/`;
export const WS_TASKFEED_URL = `ws://${IPV4}:8000/ws/taskfeed/`;
export const WS_TASKREQUEST_BASE_URL = `ws://${IPV4}:8000/ws/task-requests/`;
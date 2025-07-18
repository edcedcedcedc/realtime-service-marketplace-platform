import { useEffect } from "react";
import Toast from "react-native-toast-message";
import useStore, { TaskRequest } from "../store/useStore";
import { SocketManager } from "../utils/socketManager";
import { useNetwork } from "./useNetwork";

const taskRequestsSocket = new SocketManager();

export function useTaskRequests() {
  const { getTaskRequestUrl } = useNetwork();
  const currentTask = useStore((state) => state.currentTask);
  const addRequest = useStore((state) => state.addRequest);
  const clearRequest = useStore((state) => state.clearRequest);
  const clearRequests = useStore((state) => state.clearRequests);
  const currentUserId = useStore.getState().auth.user?.id;

  useEffect(() => {
    if (!currentTask) {
      return;
    }

    const wsUrl = getTaskRequestUrl(currentTask.id, 0)!;

    taskRequestsSocket.connect(
      wsUrl,
      `taskrequest ${currentTask.id} user ${currentUserId}`
    );

    const handleOnAdd = (payload: TaskRequest) => {
      Toast.show({
        type: "info",
        text1: `New request for task ${currentTask.id} from ${payload.tasker_username}`,
        text2: "Task requests",
      });
      addRequest(payload);
    };

    const handleOnDelete = (payload: {
      task_request_id: number;
      task_id: number;
      tasker_id: number;
    }) => {
      Toast.show({
        type: "success",
        text1: `Request ${payload.task_request_id} removed`,
        text2: "Task requests",
      });
      clearRequest(payload.task_request_id);
    };

    const handleOnOpen = () => {
      Toast.show({
        type: "success",
        text1: "Websocket Connected!",
        text2: "Task requests",
      });
    };

    const handleOnClose = () => {
      Toast.show({
        type: "info",
        text1: "Websocket Disconnected!",
        text2: "Task requests",
      });
    };

    taskRequestsSocket.on("socket:onopen", handleOnOpen);
    taskRequestsSocket.on("socket:onclose", handleOnClose);
    taskRequestsSocket.on("taskrequest:new", handleOnAdd);
    taskRequestsSocket.on("taskrequest:delete", handleOnDelete);
    taskRequestsSocket.on("taskrequest:initiate-by-tasker", handleOnDelete);
    taskRequestsSocket.on("taskrequest:cancelled-by-client", handleOnDelete);
    taskRequestsSocket.on("taskrequest:cancelled-by-tasker", handleOnDelete);
    taskRequestsSocket.on("taskrequest:accepted-by-client", handleOnDelete);
    taskRequestsSocket.on("taskrequest:confirmed-by-tasker", handleOnDelete);
    return () => {
      taskRequestsSocket.off("socket:onopen", handleOnOpen);
      taskRequestsSocket.off("socket:onclose", handleOnClose);
      taskRequestsSocket.off("taskrequest:new", handleOnAdd);
      taskRequestsSocket.off("taskrequest:delete", handleOnDelete);
      taskRequestsSocket.off("taskrequest:initiate-by-tasker", handleOnDelete);
      taskRequestsSocket.off("taskrequest:cancelled-by-client", handleOnDelete);
      taskRequestsSocket.off("taskrequest:cancelled-by-tasker", handleOnDelete);
      taskRequestsSocket.off("taskrequest:accepted-by-client", handleOnDelete);
      taskRequestsSocket.off("taskrequest:confirmed-by-tasker", handleOnDelete);
      taskRequestsSocket.disconnect("manually disconnected");
      //clearRequests();
    };
  }, [currentTask]);
}

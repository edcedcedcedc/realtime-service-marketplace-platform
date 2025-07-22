import { useEffect } from "react";
import Toast from "react-native-toast-message";
import useStore, { TaskRequest } from "../store/useStore";
import { SocketManager } from "../utils/socketManager";
import { useNetwork } from "./useNetwork";

const taskRequestsSocket = new SocketManager();

export function useTaskRequest() {
  const { getTaskRequestUrl } = useNetwork();

  const addTaskRequest = useStore((state) => state.addTaskRequest);
  const deleteTaskRequest = useStore((state) => state.deleteTaskRequest);
  const deleteTaskRequests = useStore((state) => state.deleteTaskRequests);
  const setIsInitDialog = useStore().setIsInitDialog;

  const currentTaskId = useStore((state) => state.currentTaskId);
  const currentUserId = useStore.getState().auth.user?.id;
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const isSearching = useStore((state) => state.isSearching);
  const refreshTaskRequestSocket = useStore(
    (state) => state.refreshTaskRequestSocket
  );

  useEffect(() => {
    if (!currentTaskId || !isLoggedIn) return;
    console.log(currentTaskId, "current task if from useTaskRequest");
    const wsUrl = getTaskRequestUrl(currentTaskId, 0);
    if (!wsUrl) return;

    taskRequestsSocket.setIsLoggedIn(isLoggedIn);
    taskRequestsSocket.connect(
      wsUrl,
      `taskrequest ${currentTaskId} user ${currentUserId}`
    );

    // === Event Handlers ===
    const onInitiateByTasker = (payload: TaskRequest) => {
      if (payload.client_id === currentUserId) {
        addTaskRequest(payload);
        Toast.show({
          type: "info",
          text1: `New request from ${payload.tasker_username}`,
          text2: `Task ${currentTaskId}`,
        });
      }
    };

    const onCancelledByTasker = (payload: TaskRequest) => {
      if (payload.client_id === currentUserId) {
        deleteTaskRequest(payload.id);
        Toast.show({
          type: "info",
          text1: `Request cancelled by ${payload.tasker_name}`,
          text2: `Task ${currentTaskId}`,
        });
      }
    };

    const onCancelledByClient = (payload: TaskRequest) => {
      if (
        payload.tasker_id === currentUserId &&
        payload.action?.tasker === "close_modal"
      ) {
        setIsInitDialog(false);
        Toast.show({
          type: "error",
          text1: "Client cancelled the request",
          text2: `Task Request id ${payload.id}`,
        });
      }
      if (payload.client_id === currentUserId) {
        deleteTaskRequest(payload.id);
      }
    };

    const onAcceptedByClient = (payload: TaskRequest) => {
      if (
        payload.tasker_id === currentUserId &&
        payload.action?.tasker === "close_modal"
      ) {
        setIsInitDialog(false);
        //do something else
        Toast.show({
          type: "error",
          text1: "Client accepted the request",
          text2: `Task Request id ${payload.id}`,
        });
      }
    };

    const onConfirmedByTasker = (payload: TaskRequest) => {
      if (
        payload.tasker_id === currentUserId &&
        payload.action?.tasker === "close_modal"
      ) {
        setIsInitDialog(false);
        Toast.show({
          type: "error",
          text1: "Client cancelled the request",
          text2: `Task Request id ${payload.id}`,
        });
      }
    };

    const onSocketClose = () => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: "Websocket disconnected!",
          text2: `Server closed the connection, ${currentTaskId} ${currentTaskId}`,
        });
      }, 100);
    };

    const onSocketOpen = () => {
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Websocket connected!",
          text2: `useTaskRequests ${currentTaskId} ${currentUserId}`,
        });
      }, 4000);
    };

    // === Register Events ===
    taskRequestsSocket.on("socket:onopen", onSocketOpen);
    taskRequestsSocket.on("socket:onclose", onSocketClose);

    taskRequestsSocket.on("taskrequest:initiate-by-tasker", onInitiateByTasker);
    taskRequestsSocket.on(
      "taskrequest:cancelled-by-tasker",
      onCancelledByTasker
    );
    taskRequestsSocket.on(
      "taskrequest:cancelled-by-client",
      onCancelledByClient
    );
    taskRequestsSocket.on("taskrequest:accepted-by-client", onAcceptedByClient);

    /* taskRequestsSocket.on(
      "taskrequest:confirmed-by-tasker",
      onConfirmedByTasker
    ); */

    return () => {
      taskRequestsSocket.off("socket:onopen", onSocketOpen);
      taskRequestsSocket.off("socket:onclose", onSocketClose);
      taskRequestsSocket.off(
        "taskrequest:initiate-by-tasker",
        onInitiateByTasker
      );
      taskRequestsSocket.off(
        "taskrequest:cancelled-by-tasker",
        onCancelledByTasker
      );
      taskRequestsSocket.off(
        "taskrequest:cancelled-by-client",
        onCancelledByClient
      );
      taskRequestsSocket.off(
        "taskrequest:accepted-by-client",
        onAcceptedByClient
      );
      taskRequestsSocket.disconnect("useTaskRequest unmount");
    };
  }, [refreshTaskRequestSocket, isLoggedIn, isSearching]);

  return {
    currentTaskId,
    addTaskRequest,
    deleteTaskRequest,
    deleteTaskRequests,
  };
}

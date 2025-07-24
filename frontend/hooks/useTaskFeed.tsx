import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import useStore, { Task } from "../store/useStore";
import { SocketManager } from "../utils/socketManager";
import { useNetwork } from "./useNetwork";
import api from "../services/api";
import { withTimeout } from "../utils/withTimeout";

const taskFeedSocket = new SocketManager();

export function useTaskFeed() {
  const { wsTaskFeedUrl } = useNetwork();
  const addTask = useStore.getState().addTask;
  const removeTask = useStore.getState().removeTask;
  const isSearching = useStore((state) => state.isSearching);

  const user = useStore().auth.user;
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const refreshTaskFeedSocket = useStore(
    (state) => state.refreshTaskFeedSocket
  );
  const setRefreshTaskFeedSocket = useStore().setRefreshTaskFeedSocket;

  const { setTasks } = useStore();

  useEffect(() => {
    if (!wsTaskFeedUrl || !isLoggedIn || !user?.id) {
      console.log("Delaying socket connection — missing data");
      const timeout = setTimeout(() => {
        console.log("Retrying useTaskFeed connection...");
        setRefreshTaskFeedSocket(); // This will re-trigger the useEffect
      }, 1000); // Retry in 1 second

      return () => clearTimeout(timeout); // Cleanup in case component unmounts
    }

    const fetchTasks = async () => {
      try {
        const response = await withTimeout(api.get("/tasks/open/"));
        setTasks(response.data);
      } catch (err: any) {
        console.log(err, 'await withTimeout(api.get("/tasks/open/"));');
        Toast.show({
          type: "error",
          text1: "Cannot fetch the task",
          text2:
            JSON.stringify(err.response) ||
            "Please check your internet connection",
        });
      } finally {
      }
    };

    taskFeedSocket.setIsLoggedIn(isLoggedIn);

    if (user?.role !== "tasker") {
      taskFeedSocket.disconnect("[not client, taskeed] disconnected");
    }

    taskFeedSocket.connect(wsTaskFeedUrl, `taskfeed ${user?.id}`, fetchTasks);

    const handleNewTask = (payload: Task) => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: `New task received, id:  ${payload.id}`,
          text2: "Task feed",
        });
      }, 200);
      addTask(payload);
    };

    const handleDeleteTask = (id: { id: number }) => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: `Task with id ${id.id} was deleted`,
          text2: "Task feed",
        });
      }, 100);
      removeTask(id.id); //this deletes the task from all the taskers
    };

    const onSocketOpen = () => {
      console.log(`useTaskFeed "Websocket connected!"`);
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Websocket connected!",
          text2: `useTaskFeed`,
        });
      }, 3000);
    };

    const onSocketClose = () => {
      setTimeout(() => {
        Toast.show({
          type: "info",
          text1: "Websocket connection close!",
          text2: `UseTaskFeed`,
        });
      }, 3000);
    };

    // === Register Events ===
    taskFeedSocket.on("socket:onopen", onSocketOpen);
    taskFeedSocket.on("socket:onclose", onSocketClose);
    taskFeedSocket.on("task:new", handleNewTask);
    taskFeedSocket.on("task:delete", handleDeleteTask);

    return () => {
      taskFeedSocket.off("socket:onopen", onSocketOpen);
      taskFeedSocket.off("socket:onclose", onSocketClose);
      taskFeedSocket.off("task:new", handleNewTask);
      taskFeedSocket.off("task:delete", handleDeleteTask);
      taskFeedSocket.disconnect("useTaskFeed unmounted");
    };
  }, [refreshTaskFeedSocket, isLoggedIn, isSearching]);
}

/* 

| Hook style                 | Returns socket? | Usage scenario                           |
| -------------------------- | --------------- | ---------------------------------------- |
| Side-effect only           | No              | Just listen and update store internally  |
| Controllable / interactive | Yes             | Need to emit or handle socket externally |
*/

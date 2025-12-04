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
  const { setTasks } = useStore();

  const user = useStore().auth.user;
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const isOnline = useStore((state) => state.isOnline);
  const isSearching = useStore((state) => state.isSearching);
  //const refresh = useStore((state) => state.refresh);
  const refreshTaskFeedSocket = useStore(
    (state) => state.refreshTaskFeedSocket
  );
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
    removeTask(id.id);
  };

  useEffect(() => {
    taskFeedSocket.setIsLoggedIn(isLoggedIn);
    taskFeedSocket.setIsOnline(isOnline);
    if (!wsTaskFeedUrl || !isLoggedIn || !isOnline) {
      console.log(
        "Skipping socket connection — missing URL or notLoggedIn or notOnline"
      );
      return;
    } else {
      console.log(
        `Trying socket connection — wsUrl ${wsTaskFeedUrl} isLoggedIn ${isLoggedIn}`
      );
    }
    taskFeedSocket.connect(wsTaskFeedUrl, `taskfeed ${user?.id}`, fetchTasks);
    taskFeedSocket.on("task:new", handleNewTask);
    taskFeedSocket.on("task:delete", handleDeleteTask);
    return () => {
      //taskFeedSocket.off("socket:onopen", onSocketOpen);
      //taskFeedSocket.off("socket:onclose", onSocketClose);
      taskFeedSocket.off("task:new", handleNewTask);
      taskFeedSocket.off("task:delete", handleDeleteTask);
      taskFeedSocket.disconnect("useTaskFeed unmounted");
    };
  }, [refreshTaskFeedSocket, isLoggedIn, isSearching, wsTaskFeedUrl, isOnline]);
}

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

  const user = useStore().auth.user;
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const refresh = useStore((state) => state.refresh);

  const { setTasks } = useStore();

  useEffect(() => {
    if (!wsTaskFeedUrl || !isLoggedIn) {
      console.log("Skipping socket connection — missing URL or notLoggedIn");
      return;
    } else {
      console.log(
        `Trying socket connection — wsUrl ${wsTaskFeedUrl} isLoggedIn ${isLoggedIn}`
      );
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
      removeTask(id.id);
    };

    taskFeedSocket.on("task:new", handleNewTask);
    taskFeedSocket.on("task:delete", handleDeleteTask);

    return () => {
      taskFeedSocket.off("task:new", handleNewTask);
      taskFeedSocket.off("task:delete", handleDeleteTask);
      taskFeedSocket.setIsLoggedIn(false);
      taskFeedSocket.disconnect("unmounted");
    };
  }, [refresh, isLoggedIn]);
}

/* 

| Hook style                 | Returns socket? | Usage scenario                           |
| -------------------------- | --------------- | ---------------------------------------- |
| Side-effect only           | No              | Just listen and update store internally  |
| Controllable / interactive | Yes             | Need to emit or handle socket externally |
*/

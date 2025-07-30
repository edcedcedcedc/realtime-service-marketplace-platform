import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  ViewToken,
} from "react-native";
import Toast from "react-native-toast-message";

import api from "../services/api";
import useStore, { Task } from "../store/useStore";
import { withTimeout } from "../utils/withTimeout";
import { SPACING } from "../constants/dimensions";
import { COLORS } from "../constants/colors";
import TaskCard from "./TaskCard";
import TaskSearchBar from "./TaskSearchBar";
import { useTaskFeed } from "../hooks/useTaskFeed";
import IOSModal from "../components/IOSmodal";
import { useTaskRequest } from "../hooks/useTaskRequest";
import ConnectionSnackbar from "../components/SnackBar";

const HEADER_HEIGHT = 120;

export default function TaskFeed({ navigation }: { navigation: any }) {
  const tasks = useStore((state) => state.tasks);
  const setTasks = useStore().setTasks;
  const loading = useStore((state) => state.loading);
  const setLoading = useStore().setLoading;
  const lastRefreshRef = useRef(0);
  const scrollOffsetRef = useRef(0);

  const [value, setValue] = useState("");
  const [visibleTaskIds, setVisibleTaskIds] = useState<Set<number | string>>(
    new Set()
  );
  const isInitDialog = useStore((state) => state.isInitDialog);
  const isConfirmDialog = useStore((state) => state.isConfirmDialog);
  const setIsInitDialog = useStore().setIsInitDialog;
  const setIsSearching = useStore().setIsSearching;
  const setCurrentTaskId = useStore((state) => state.setCurrentTaskId);
  const currentTaskId = useStore((state) => state.currentTaskId);
  const isConnected = useStore((state) => state.isConnected);
  const [cancelDisabled, setCancelDisabled] = useState(false);

  const ref: any = useRef(null); //delay the cancel button in init modal for tasker

  useTaskFeed();
  useTaskRequest();

  /**
   * Keeps track of which tasks are currently visible in the FlatList.
   *
   * Whenever the list scrolls and items come into or go out of view,
   * this gets called with the updated visible items.
   * We extract their IDs and store them in a Set so we can later
   * show things like the mini-map only for tasks that are on screen.
   */
  const onViewableItemsChanged = React.useCallback(
    (info: {
      viewableItems: ViewToken<Task>[];
      changed: ViewToken<Task>[];
    }) => {
      const visibleIds = new Set(info.viewableItems.map((v) => v.item.id));
      setVisibleTaskIds(visibleIds);
    },
    []
  );

  useEffect(() => {
    fetchTasks();
    return () => {
      clearTimeout(ref.current);
    };
  }, []);

  const apiOnInit = async (task_id: number) => {
    if (!isConnected) {
      return;
    }
    setIsInitDialog(true);
    setCurrentTaskId(task_id);
    setCancelDisabled(true);
    setIsSearching(true);

    if (ref.current) {
      clearTimeout(ref.current);
    }

    ref.current = setTimeout(() => {
      setCancelDisabled(false);
    }, 6000);

    try {
      const res = await api.post("initiate-task-request-as-tasker/", {
        task_id: task_id,
      });
      console.log(res.data);
    } catch (error) {
      console.warn(error, "const apiOn = async (task_id: number) =>");
    } finally {
    }
  };

  const apiOnCancel = async () => {
    if (!currentTaskId) {
      setIsInitDialog(false);
      return;
    }
    try {
      await api.post("/cancel-task-request-as-tasker/", {
        task_id: currentTaskId,
      });
      setTimeout(() => {
        Toast.show({
          type: "success",
          text1: "Task request deleted from the db",
          text2: ", sync is ok",
        });
      }, 3000);
      setCurrentTaskId(null);
      setIsSearching(false);
      setIsInitDialog(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Cannot cancel task request",
        text2: "Something went wrong while trying to cancel the request.",
      });
    } finally {
      setCancelDisabled(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await withTimeout(api.get("/tasks/open/"));
      setTasks(response.data);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Cannot fetch the tasks",
        text2:
          err.response?.data?.error || "Please check your internet connection",
      });
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event: any) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const onScrollEndDrag = (event: any) => {
    const cooldownMS = 5000;
    const now = Date.now();
    const offsetY = event.nativeEvent.contentOffset.y;

    scrollOffsetRef.current = offsetY;

    if (
      offsetY < -80 &&
      !loading &&
      now - lastRefreshRef.current > cooldownMS
    ) {
      lastRefreshRef.current = now;
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(value.toLowerCase()) ||
      task.description?.toLowerCase().includes(value.toLowerCase()) ||
      task.urgency.toLowerCase().includes(value.toLowerCase()) ||
      task.location.toLowerCase().includes(value.toLowerCase()) ||
      task.status.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mascotPlaceholder} />
      </TouchableWithoutFeedback>

      <TaskSearchBar value={value} onChangeText={setValue} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredTasks}
        keyExtractor={(item, index) => {
          if (!item?.id) {
            console.warn("⚠️ Missing task ID at index", index, item);
            return index.toString();
          }
          return item.id.toString();
        }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            isConnected={isConnected}
            isMiniMapVisible={visibleTaskIds.has(item.id)}
            handleInitTaskRequest={() => apiOnInit(item.id)}
          />
        )}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            {value.length > 0 ? (
              <Text style={{ fontSize: 16, color: COLORS.color25 }}>
                No tasks found matching your search.
              </Text>
            ) : tasks.length === 0 ? (
              <Text style={{ fontSize: 16, color: COLORS.color25 }}>
                Currently there are no tasks...
              </Text>
            ) : null}
          </View>
        }
        scrollEventThrottle={3000}
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEnabled={!loading}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 1,
        }}
      />
      <IOSModal
        visible={isInitDialog}
        isShowConfirm={false}
        cancelDisabled={cancelDisabled}
        onClose={apiOnCancel}
        onTimeout={() => {
          console.log("Auto cancelling...");
          apiOnCancel();
        }}
        title="Initiate task"
        message="Waiting for client to respond..."
        duration={30}
      />
    </View>
  );
}

const statusColors: Record<string, object> = {
  open: { color: COLORS.color1 }, // Blue
  confirmed: { color: COLORS.color2 },
  "in-progress": { color: COLORS.color3 }, // Green
  completed: { color: COLORS.color3 },
  cancelled: { color: COLORS.color5 }, // Red
  expired: { color: COLORS.color28 }, // Grey
};

const styles = StyleSheet.create({
  blueButton: {
    backgroundColor: COLORS.color10, // same as login/register
  },
  button: {
    alignItems: "center",
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
  },
  buttonText: {
    color: COLORS.color19,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  card: {
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderColor: COLORS.color18,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  container: {
    alignItems: "center",
    backgroundColor: COLORS.color19,
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.md,
  },
  description: {
    color: COLORS.color13,
    fontSize: 14,
    marginBottom: 12,
  },
  greenButton: {
    backgroundColor: COLORS.color3,
  },
  header: {
    color: COLORS.color14,
    fontSize: 28,
    fontWeight: "700",
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: COLORS.color19,
    elevation: 10,
    height: HEADER_HEIGHT,
    justifyContent: "center",
    left: 0,
    paddingTop: 40,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10, // status bar height padding
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoText: {
    color: COLORS.color12,
    fontSize: 13,
  },
  logoutButton: {
    position: "absolute",
    right: 16,
    bottom: 10,
    borderColor: COLORS.color10, // same as login/register
    borderWidth: 1.5,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: COLORS.color10,
    fontSize: 16,
    fontWeight: "600",
  },
  mascotPlaceholder: {
    height: 100, // or whatever height fits your mascot image
    width: "100%",
    // Optionally center or add background color if you want visual debugging:
    // backgroundColor: 'rgb(238, 238, 238)',
    marginBottom: SPACING.sm, // space below mascot before search bar
  },
  status: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.color13,
    fontSize: 18,
    marginBottom: 8,
  },
  yellowButton: {
    backgroundColor: COLORS.color2,
  },
});

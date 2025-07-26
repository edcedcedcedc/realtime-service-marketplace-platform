import React, { useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TaskRequestCard from "./TaskRequestCard";
import useStore from "../store/useStore";
import { COLORS } from "../constants/colors";
import api from "../services/api";
import { SPACING } from "../constants/dimensions";
import { withTimeout } from "../utils/withTimeout";

const { width } = Dimensions.get("window");

export default function TaskRequests() {
  const isConnected = useStore((state) => state.isConnected);
  const cancelDisabled = false;
  const currentTaskId = useStore((state) => state.currentTaskId);
  const taskRequests = useStore((state) => state.taskRequests);
  const setTaskRequests = useStore().setTaskRequests;
  const setLoading = useStore().setLoading;
  const deleteTaskRequest = useStore().deleteTaskRequest;
  const deleteTaskRequests = useStore().deleteTaskRequests;

  const lastRefreshRef = useRef(0);

  const fetchTaskRequests = async () => {
    try {
      setLoading(true);
      const response = await withTimeout(
        api.get(`task-requests/${currentTaskId}/`)
      );
      setTaskRequests(response.data);
    } catch (err: any) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const now = Date.now();
    const cooldown = 5000;

    if (offsetY < -80 && now - lastRefreshRef.current > cooldown) {
      lastRefreshRef.current = now;
      fetchTaskRequests();
    }
  };

  const handleDeclineTaskRequestClient = async (
    taskerId: number,
    taskId: number
  ) => {
    try {
      const res = await api.post("cancel-task-request-as-client/", {
        task_id: taskId,
        tasker_id: taskerId,
      });
      deleteTaskRequest(res.data.id);
    } catch (error) {
      console.warn("Failed to cancel request", error);
    }
  };

  const handleAcceptTaskRequestClient = async (
    taskerId: number,
    taskId: number
  ) => {
    try {
      const res = await api.post("accept-task-request-as-client/", {
        task_id: taskId,
        tasker_id: taskerId,
      });
      deleteTaskRequests();
    } catch (error) {
      console.warn("Failed to accept request", error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        style={{ paddingTop: 10 }}
        data={taskRequests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          taskRequests.length === 0 && styles.full,
        ]}
        scrollEventThrottle={3000}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No requests at this time.</Text>
          </View>
        }
        onScrollEndDrag={handleScrollEnd}
        renderItem={({ item }) => (
          <TaskRequestCard
            item={item}
            handleAccept={handleAcceptTaskRequestClient}
            handleDecline={handleDeclineTaskRequestClient}
            disableInteraction={cancelDisabled || !isConnected}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.color19,
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  list: {
    paddingBottom: 16,
  },
  full: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.color13,
    textAlign: "center",
  },
});

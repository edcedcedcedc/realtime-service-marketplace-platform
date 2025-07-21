import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import TinySpinner from "../components/TinySpinner";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onTimeout?: () => void;
  duration?: number; // in seconds
  title: string;
  message: string;
  isShowConfirm: boolean;
  cancelDisabled: boolean;
};

export default function IOSModal({
  visible,
  onClose,
  onConfirm,
  onTimeout,
  duration = 0,
  title,
  message,
  isShowConfirm,
  cancelDisabled,
}: Props) {
  const animation = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && duration > 0) {
      animation.setValue(0);

      Animated.timing(animation, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        onTimeout?.();
        timeoutRef.current = null;
      }, duration * 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible]);

  const progressWidth = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.8],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          {duration > 0 && (
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          )}

          <Text style={styles.title}>{title}</Text>

          <View style={styles.row}>
            <Text style={styles.message}>{message}</Text>
            <TinySpinner message="" />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancel}
              onPress={onClose}
              disabled={cancelDisabled}
            >
              {cancelDisabled ? (
                <Text style={styles.cancelTextDisabled}>Cancel</Text>
              ) : (
                <Text style={styles.cancelText}>Cancel</Text>
              )}
            </TouchableOpacity>

            {isShowConfirm && (
              <TouchableOpacity style={styles.confirm} onPress={onConfirm}>
                <Text style={styles.confirmText}>Accept</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    paddingTop: 5,
    width: width * 0.8,
    elevation: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#007aff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: "absolute",
    top: 0,
    left: 0,
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancel: {
    padding: 10,
    flex: 1,
    marginRight: 10,
  },
  confirm: {
    padding: 10,
    flex: 1,
    marginLeft: 10,
  },
  cancelText: {
    color: "#007aff",
    fontSize: 17,
    textAlign: "center",
  },
  cancelTextDisabled: {
    color: "#898b8dff",
    fontSize: 17,
    textAlign: "center",
  },
  confirmText: {
    color: "#007aff",
    fontSize: 17,
    textAlign: "center",
  },
});

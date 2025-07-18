import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  Modal,
  View,
  ScrollView,
  StyleSheet,
  Button,
} from "react-native";
import useStore from "../store/useStore";
import Toast from "react-native-toast-message";
import { withTimeout } from "../utils/withTimeout";
import { logout } from "../utils/logout";
import api from "../services/api";
import TinySpinner from "../components/TinySpinner";

interface Props {
  modalVisible: boolean;
  setModalVisible: (param: boolean) => void;

  handleLogin: (data: any) => void;
  navigation: any;
}

export default function TermsAndConditions({
  modalVisible,
  setModalVisible,
  navigation,
}: Props) {
  const auth = useStore((state) => state.auth);
  const setLoading = useStore.getState().setLoading;
  const loading = useStore((state) => state.loading);
  const [termsText, setTermsText] = useState("");
  const [tinyLoading, setTinyLoading] = useState(false);

  useEffect(() => {
    const fetchTscText = async () => {
      try {
        setTinyLoading(true);
        const res = await withTimeout(
          api.get("/current-tsc-text/"),
          5000,
          "Request timed out. Please try again",
        );
        setTermsText(res.data.tsc);
      } catch (err) {
        console.error(err);
      } finally {
        setTinyLoading(false);
      }
    };
    fetchTscText();
  }, []);

  const handleAccept = async () => {
    try {
      const res = await withTimeout(
        api.post("/accept-terms/", {}),
        5000,
        "Request timed out. Please try again",
      );
      Toast.show({
        type: "success",
        text1: "TsC timestamp success!",
        text2:
          res.data.message ||
          "Please check your credentials and internet connection",
      });
      navigation.replace(
        auth.user?.role === "client" ? "Search a tasker" : "Task feed",
      );
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          err.response?.data?.error ||
          "Please check your credentials and internet connection",
      });
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  const handleReject = () => {
    setModalVisible(false);
    //logout();
  };

  return (
    <>
      {/* <TouchableOpacity
        //onPress={() => setModalVisible(true)}
        style={{ alignSelf: "center", marginTop: 10 }}
      >
        <Text style={styles.terms}>Termeni și Condiții</Text>
      </TouchableOpacity> */}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.termsText}>
                {tinyLoading ? <TinySpinner /> : termsText}
              </Text>
            </ScrollView>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Button title="Accept" onPress={handleAccept} />
              <Button title="Reject" onPress={handleReject} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  terms: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalContainer: {
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 10,
    maxHeight: "80%",
    overflow: "hidden",
  },
  termsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#333",
  },
});

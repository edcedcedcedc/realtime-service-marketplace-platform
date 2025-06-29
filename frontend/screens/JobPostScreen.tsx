import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";
import useStore, { Job, JobFormInput } from "../store/useStore";
import { withTimeout } from "../utils/withTimeout";
import api from "../services/api";

export default function PostJobScreen({ navigation }: { navigation: any }) {
  const setLoading = useStore((state) => state.setLoading);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormInput>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      category: "",
      budget: "",
      urgency: "now",
    },
  });

  const fields = [
    "title",
    "description",
    "location",
    "category",
    "budget",
    "urgency",
  ] as const;

  const onSubmit = async (data: JobFormInput) => {
    try {
      setLoading(true);
      await withTimeout(api.post("/jobs/create/", data));
      Toast.show({
        type: "success",
        text1: "Job Posted Successfully",
      });
      //navigation.goBack();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error Posting Job",
        text2: err.response?.data?.error || "Try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%" }}>
          <Text style={styles.title}>Post a Job</Text>

          {fields.map((field) => (
            <Controller
              key={field}
              control={control}
              name={field}
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  style={[styles.input, errors[field] && styles.inputError]}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor="#999"
                  selectionColor="#2962FF"
                />
              )}
            />
          ))}

          <TouchableOpacity
            style={[styles.button, styles.postButton]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Post Job</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    color: "#212121",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#212121",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  postButton: {
    backgroundColor: "#388E3C",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});

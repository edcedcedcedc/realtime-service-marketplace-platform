import { CommonActions } from "@react-navigation/native";
import useStore from "../store/useStore";
import { navigationRef } from "./navigationRef";

export const logout = () => {
  const setLoading = useStore.getState().setLoading;
  setLoading(true);
  setTimeout(() => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Start" }],
      }),
    );
    setLoading(false);
  }, 10);
};

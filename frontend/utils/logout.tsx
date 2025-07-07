import { CommonActions } from "@react-navigation/native";
import useStore from "../store/useStore";
import { navigationRef } from "./navigationRef";
import { useEffect } from "react";

export const logout = () => {
  const setLoading = useStore.getState().setLoading;
  setLoading(true);
  setTimeout(() => {
    useStore.getState().resetStore();
  }, 20);
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

import { CommonActions } from "@react-navigation/native";

import useStore from "../store/useStore";
import { navigationRef } from "./navigationRef";

export const logout = () => {
  const setLoading = useStore.getState().setLoading;
  const setIsLoggedIn = useStore.getState().setIsLoggedIn;
  setLoading(true);
  setIsLoggedIn(false);
  setTimeout(() => {
    useStore.getState().resetStore();
  }, 20);

  setTimeout(() => {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Start" }],
      })
    );
    setLoading(false);
  }, 10);
};

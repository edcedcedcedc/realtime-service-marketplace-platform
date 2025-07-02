import useStore from "../store/useStore";

export const logout = (navigation: any) => {
  const setLoading = useStore.getState().setLoading;

  setLoading(true);

  setTimeout(() => {
    navigation.replace("Start");
    setLoading(false);
  }, 10);
};

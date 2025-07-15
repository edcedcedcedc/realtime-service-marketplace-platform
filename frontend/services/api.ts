import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { navigationRef } from "../utils/navigationRef";
import useStore from "../store/useStore";
import { HTTP_BASE_URL } from "../constants/network";
import axios from "axios";

const api = axios.create({
  baseURL: HTTP_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  console.log("baseURL:", config.baseURL);
  console.log("url:", config.url);

  if (config.url?.endsWith("/register/") || config.url?.endsWith("/login/")) {
    return config;
  }

  const accessToken = useStore.getState().auth.jwt?.access;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    console.log(config.headers.Authorization, "auth");
  } else {
    console.error("No JWT token found");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status == 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const store = useStore.getState();
      const refresh = store.auth.jwt?.refresh;

      if (refresh) {
        try {
          const res = await axios.post(`${HTTP_BASE_URL}token/refresh/`, {
            refresh,
          });
          store.setAuth(
            { access: res.data.access, refresh: res.data.refresh ?? refresh },
            store.auth.user,
          );
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          store.clearAuth();
          return new Promise((resolve, reject) => {
            Alert.prompt(
              "Session Expired",
              "Please enter your password to continue",
              [
                {
                  text: "OK",
                  onPress: async (password: any) => {
                    try {
                      const store = useStore.getState();
                      const loginResponse = await axios.post(
                        `${HTTP_BASE_URL}login/`,
                        {
                          username: store.auth.user?.username,
                          password: password,
                        },
                      );
                      const { access, refresh } = loginResponse.data;
                      store.setAuth(
                        { access, refresh },
                        loginResponse.data.user,
                      );
                      originalRequest.headers.Authorization = `Bearer ${access}`;

                      const response = await api(originalRequest);
                      resolve(response);
                    } catch (loginError) {
                      const store = useStore.getState();
                      store.clearAuth();
                      navigationRef.current?.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: "Start" }],
                        }),
                      );
                      reject(loginError);
                    }
                  },
                },
              ],
              "secure-text",
            );
          });
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

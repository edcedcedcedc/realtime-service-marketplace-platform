import axios from "axios";
import useStore from "../store/useStore";

const API_BASE_URL = "http://192.168.1.4:8000/api/";
export const WS_URL = "ws://192.168.1.4:8000/ws/jobs/";

const api = axios.create({
  baseURL: API_BASE_URL,
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
          const res = await axios.post(`${API_BASE_URL}token/refresh/`, {
            refresh,
          });
          store.setAuth({ access: res.data.access, refresh }, store.auth.user);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.log("Refresh token failed:", refreshError);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

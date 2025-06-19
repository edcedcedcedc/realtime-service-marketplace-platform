import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.4:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  if (config.url?.endsWith("/register/") || config.url?.endsWith("/login/")) {
    return config;
  }
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error("No JWT token found");
  }
  return config;
});

export default api;

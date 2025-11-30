// apis.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});


api.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem("token");

    if (!token && typeof localStorage !== "undefined") {
      token = localStorage.getItem("token") || null;
    }
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

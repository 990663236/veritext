// apis.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// añade automáticamente el Authorization si existe
api.interceptors.request.use(async (config) => {
  try {
    let token = await AsyncStorage.getItem("token");
    // fallback para web si no usas AsyncStorage en web
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

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Config por ENV:
 * EXPO_PUBLIC_API_BASE   -> ej: http://127.0.0.1:8000
 * EXPO_PUBLIC_API_PREFIX -> ej: /api (si usas /api/...)
 * EXPO_PUBLIC_ANALYZE    -> ej: /analyze/text
 */
const RAW_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_PREFIX = (process.env.EXPO_PUBLIC_API_PREFIX || "").replace(/\/+$/, "");
const ANALYZE_PATH =
  process.env.EXPO_PUBLIC_ANALYZE || "/analyze/text";

// Normaliza baseURL sin barra final
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

function buildPath(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${API_PREFIX}${p}`;
}

const http = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem("token", token);
  else await AsyncStorage.removeItem("token");
}

/* ------- Auth ------- */
export async function register(email: string, password: string) {
  return http.post(buildPath("/auth/register"), { email, password });
}

export async function login(email: string, password: string) {
  const { data } = await http.post<{ token: string }>(
    buildPath("/auth/login"),
    { email, password }
  );
  await setToken(data.token);
  return data.token;
}

export async function verify() {
  return http.get(buildPath("/auth/verify"));
}

export async function logout() {
  await setToken(null);
}

/* ------- Análisis ------- */
export async function analyzeText(text: string) {
  const url = buildPath(ANALYZE_PATH);
  console.log("[analyzeText] POST ->", url);

  try {
    const { data } = await http.post(
      url,
      { text },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data as { score: number; buckets: any; top_words: string[] };
  } catch (err: any) {
    const serverMsg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      `${err?.response?.status} ${err?.response?.statusText}`;
    console.warn("[analyzeText] Error:", serverMsg);
    throw new Error(serverMsg || "No se pudo analizar");
  }
}

export async function getHistory() {
  const { data } = await http.get(buildPath("/history"));
  return data as Array<{
    id: number;
    score: number;
    top_words: string[];
    created_at: string;
  }>;
}

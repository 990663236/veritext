import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEYS = ["token", "user"]; // ajusta según tus claves

export async function signOut() {
  try {
    await AsyncStorage.multiRemove(AUTH_KEYS);
  } catch {}
}

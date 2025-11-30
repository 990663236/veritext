import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEYS = ["token", "user"];

export async function signOut() {
  try {
    await AsyncStorage.multiRemove(AUTH_KEYS);
  } catch {}
}

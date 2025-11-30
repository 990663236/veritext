// app/index.tsx
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import { setToken, verify } from "../lib/api";

export default function Index() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        if (!t) { router.replace("/login"); return; }

        await setToken(t);         
        await verify();            
        router.replace("/home");
      } catch {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

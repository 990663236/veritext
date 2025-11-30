import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync().catch(()=>{});

export default function RootLayout() {
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(()=>{}), 1200);
    return () => clearTimeout(t);
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}

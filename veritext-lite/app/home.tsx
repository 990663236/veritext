// app/home.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGIN_ROUTE = "/login";

const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "user"]);
  } catch (e) {
    console.warn("clearSession error:", e);
  }
};

const Tile = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={s.tile} activeOpacity={0.8}>
    <Text style={s.tileText}>{title}</Text>
  </TouchableOpacity>
);

export default function Home() {
  const [showConfirm, setShowConfirm] = useState(false);

  const doLogout = async () => {
    console.log("[logout] confirmado");
    await clearSession();

    try {
      router.replace(LOGIN_ROUTE);
    } catch (e) {
      console.warn("replace falló, intento push:", e);
      try {
        router.push(LOGIN_ROUTE);
      } catch (e2) {
        console.warn("push falló, intento ir al root '/':", e2);
        router.replace("/");
      }
    }
  };

  const onLogout = () => {
    setShowConfirm(true);
  };

  const cancelLogout = () => setShowConfirm(false);

  const confirmLogout = async () => {
    setShowConfirm(false);
    await doLogout();
  };

  return (
    <View style={s.container}>
      {/* Botón flotante de cerrar sesión */}
      <TouchableOpacity
        onPress={onLogout}
        style={s.logoutFab}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.teal} />
      </TouchableOpacity>

      <Text style={s.h1}>
        Detector de{"\n"}Texto por IA
      </Text>
      <Text style={s.subtitle}>Bienvenido</Text>

      <View style={s.grid}>
        <Tile title="Analizar Texto" onPress={() => router.push("/analyze")} />
        <Tile title="Subir Archivo" onPress={() => router.push("/upload")} />
        <Tile
          title="Historial de Análisis"
          onPress={() => router.push("/history")}
        />
      </View>

      {/* Modal de confirmación propio */}
      {showConfirm && (
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Cerrar sesión</Text>
            <Text style={s.modalText}>
              ¿Seguro que quieres cerrar sesión?
            </Text>

            <View style={s.modalActions}>
              <TouchableOpacity
                onPress={cancelLogout}
                style={[s.btn, s.btnSecondary]}
                activeOpacity={0.8}
              >
                <Text style={s.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                style={[s.btn, s.btnPrimary]}
                activeOpacity={0.8}
              >
                <Text style={s.btnPrimaryText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
  },
  logoutFab: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1000,
    padding: 8,
    borderRadius: 999,
  },
  h1: {
    fontSize: 28,
    color: colors.teal,
    fontWeight: "900",
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    color: "#51656a",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  tile: {
    width: "46%",
    height: 110,
    backgroundColor: "#d7e5ed",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  tileText: {
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  /* Modal */
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modal: {
    width: "80%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.teal,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnSecondary: {
    backgroundColor: "#E5E7EB",
  },
  btnSecondaryText: {
    color: "#374151",
    fontWeight: "600",
  },
  btnPrimary: {
    backgroundColor: colors.teal,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});

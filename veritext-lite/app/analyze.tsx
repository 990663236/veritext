import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { analyzeText } from "../lib/api";
import { router } from "expo-router";
import { colors } from "../constants/theme";

export default function Analyze() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const goHome = () => router.replace("/");

  const onAnalyze = async () => {
    const payload = text.trim();
    if (!payload) return Alert.alert("Pega un texto");
    try {
      setLoading(true);
      const data = await analyzeText(payload);
      router.push({ pathname: "/result", params: { payload: JSON.stringify(data) } });
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.detail || "No se pudo analizar";
      Alert.alert("Error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Volver al menú principal"
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={s.backBtn}
        >
          <Ionicons name="arrow-back" size={26} color={colors.teal} />
        </TouchableOpacity>
        <Text style={s.title}>Analizar Texto</Text>
      </View>

      <TextInput
        placeholder="PEGAR TEXTO AQUI"
        placeholderTextColor="#9aa3ad"
        value={text}
        onChangeText={setText}
        multiline
        style={s.box}
      />

      <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={onAnalyze} disabled={loading}>
        <Text style={s.btnTxt}>{loading ? "Analizando..." : "Analizar Texto"}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { paddingRight: 8, paddingVertical: 2, marginRight: 6 },
  title: { fontSize: 32, color: colors.teal, fontWeight: "900" },
  box: {
    backgroundColor: "#f1f2f7", borderRadius: 24, minHeight: 180,
    padding: 16, textAlignVertical: "top", color: colors.text,
  },
  btn: { backgroundColor: colors.cream, marginTop: 16, padding: 16, borderRadius: 16, alignItems: "center" },
  btnTxt: { color: colors.teal, fontWeight: "900", fontSize: 18 },
});

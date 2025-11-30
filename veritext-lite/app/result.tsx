import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Donut from "../components/Donut";
import { colors } from "../constants/theme";

const Dot = ({ color }: { color: string }) => (
  <View
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: color,
      marginRight: 12,
    }}
  />
);

export default function Result() {
  const { payload } = useLocalSearchParams<{ payload: string }>();
  const data = payload ? JSON.parse(payload) : null;

  // Probabilidad de IA desde el backend (score o buckets.ai)
  const rawScore =
    typeof data?.score === "number"
      ? data.score
      : typeof data?.buckets?.ai === "number"
      ? data.buckets.ai
      : 0;

  // Normalizamos al rango [0, 1]
  const pIA = Math.min(Math.max(rawScore, 0), 1);
  const pHum = 1 - pIA;

  const iaPct = Math.round(pIA * 100);
  const humPct = Math.round(pHum * 100);

  // Clasificación textual según rango
  let mainLabel = "";
  let detailLabel = "";

  if (pIA < 0.33) {
    mainLabel = "Predicción: texto original humano";
    detailLabel = `Probabilidad de IA baja (${iaPct} %) y probabilidad de humano alta (${humPct} %).`;
  } else if (pIA < 0.66) {
    mainLabel = "Predicción: texto mixto";
    detailLabel = `Se observan señales tanto de texto humano como de IA (IA ≈ ${iaPct} %, humano ≈ ${humPct} %).`;
  } else {
    mainLabel = "Predicción: texto generado por IA";
    detailLabel = `Probabilidad de IA alta (${iaPct} %) y probabilidad de humano baja (${humPct} %).`;
  }

  // Donut con solo 2 segmentos: humano vs IA
  const segs = [
    { value: pHum, color: colors.donutPink },
    { value: pIA, color: colors.donutBlue },
  ];

  const center = `${iaPct} %`;

  const goHome = () => router.replace("/");

  return (
    <View style={s.container}>
      {/* Flecha para volver a Home */}
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
        <Text style={s.title}>Resultado</Text>
      </View>

      <View style={{ alignItems: "center", marginVertical: 8 }}>
        <Donut segments={segs} centerText={center} />
      </View>

      {/* Texto explicativo */}
      <View style={{ marginTop: 16 }}>
        <Text style={s.mainLabel}>{mainLabel}</Text>
        <Text style={s.detailLabel}>{detailLabel}</Text>
      </View>

      {/* Leyenda con porcentajes claros */}
      <View style={{ marginTop: 20, gap: 12 }}>
        <Row
          color={colors.donutPink}
          label={`Texto humano (${humPct} %)`}
        />
        <Row
          color={colors.donutBlue}
          label={`Texto generado por IA (${iaPct} %)`}
        />
      </View>
    </View>
  );
}

function Row({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Dot color={color} />
      <Text style={{ color: colors.text, fontSize: 18 }}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { paddingRight: 8, paddingVertical: 2, marginRight: 6 },
  title: { fontSize: 32, color: colors.teal, fontWeight: "900" },
  mainLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
});

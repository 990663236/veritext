import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getHistory } from "../lib/api";
import { colors } from "../constants/theme";

type HistItem = {
  id: number;
  score: number;        // probabilidad de IA (0–1)
  top_words: string[];
  created_at: string;
};

export default function History() {
  const [items, setItems] = useState<HistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg =
        e?.message ||
        e?.response?.data?.detail ||
        "No se pudo cargar el historial";
      Alert.alert("Error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const goHome = () => router.replace("/");

  const classify = (score: number) => {
    if (score < 0.33) return "Principalmente humano";
    if (score < 0.66) return "Texto mixto";
    return "Principalmente IA";
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
        <Text style={s.h1}>Historial de análisis</Text>
      </View>

      {loading ? (
        <View style={{ paddingTop: 16, alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.teal} />
        </View>
      ) : items.length === 0 ? (
        <Text style={{ color: "#6b7280" }}>Aún no hay análisis registrados.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => String(it.id)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const iaPct = Math.round(item.score * 100);
            const humPct = 100 - iaPct;
            const label = classify(item.score);

            return (
              <View style={s.row}>
                <View>
                  <Text style={s.doc}>Documento {item.id}</Text>
                  <Text style={s.sub}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>

                <View style={s.pill}>
                  <Text style={s.pillMain}>{iaPct}% IA</Text>
                  <Text style={s.pillSub}>{humPct}% humano</Text>
                  <Text style={s.pillTag}>{label}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { paddingRight: 8, paddingVertical: 2, marginRight: 6 },
  h1: { fontSize: 28, color: colors.teal, fontWeight: "900" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F8",
    padding: 18,
    borderRadius: 28,
  },
  doc: { fontSize: 18, color: colors.text },
  sub: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  pill: {
    backgroundColor: "#EDEFF6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "flex-end",
  },
  pillMain: {
    color: colors.teal,
    fontWeight: "700",
    fontSize: 16,
  },
  pillSub: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 2,
  },
  pillTag: {
    color: "#6b7280",
    fontSize: 11,
    marginTop: 2,
  },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/theme";

export default function BackHeader({ title }: { title?: string }) {
  const goHome = () => router.replace("/");

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        onPress={goHome}
        accessibilityRole="button"
        accessibilityLabel="Volver al menú principal"
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        style={s.iconBtn}
      >
        <Ionicons name="arrow-back" size={26} color={colors.teal} />

      </TouchableOpacity>

      {title ? <Text style={s.title}>{title}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBtn: {
    padding: 2,
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    color: colors.teal,
    fontWeight: "900",
  },
});

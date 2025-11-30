// app/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../constants/theme";
import { register, login } from "../lib/api";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const goBack = () => router.replace("/login");
  const goToLogin = () => router.replace("/login");

  const onSubmit = async () => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();
    setErrorMsg(null);

    if (!cleanEmail || !password || !password2) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== password2) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      // 1) Registrar usuario
      await register(cleanEmail, password);

      // 2) Intentar login automático
      try {
        await login(cleanEmail, password);
        setErrorMsg(null);
        router.replace("/");
      } catch {
        setErrorMsg(null);
        goToLogin();
      }
    } catch (e: any) {
      const status = e?.response?.status;
      const rawDetail =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        "";

      console.log("REGISTER ERROR >>>", status, e?.response?.data);

      let msg =
        String(rawDetail) || "No se pudo completar el registro.";

      // Caso específico: correo duplicado
      const lower = String(rawDetail).toLowerCase();
      if (
        status === 409 ||
        lower.includes("ya está registrado") ||
        lower.includes("ya esta registrado") ||
        lower.includes("duplicate entry") ||
        lower.includes("1062")
      ) {
        msg = "El email ya está registrado. Intenta iniciar sesión.";
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#020617" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={s.container}>
        {/* Botón atrás */}
        <TouchableOpacity
          onPress={goBack}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={24} color="#e5e7eb" />
        </TouchableOpacity>

        {/* Título */}
        <View style={s.header}>
          <Text style={s.title}>VERITEXT</Text>
          <Text style={s.subtitle}>STUDENT · REGISTRO</Text>
        </View>

        {/* Formulario */}
        <View style={s.form}>
          <Text style={s.label}>Correo electrónico</Text>
          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errorMsg) setErrorMsg(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu.correo@example.com"
            placeholderTextColor="#9ca3af"
            style={s.input}
          />

          <Text style={s.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errorMsg) setErrorMsg(null);
            }}
            secureTextEntry
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#9ca3af"
            style={s.input}
          />

          <Text style={s.label}>Repetir contraseña</Text>
          <TextInput
            value={password2}
            onChangeText={(t) => {
              setPassword2(t);
              if (errorMsg) setErrorMsg(null);
            }}
            secureTextEntry
            placeholder="Repite la contraseña"
            placeholderTextColor="#9ca3af"
            style={s.input}
          />

          {/* Mensaje de error */}
          {errorMsg && <Text style={s.errorText}>{errorMsg}</Text>}

          {/* Botón principal */}
          <TouchableOpacity
            onPress={onSubmit}
            disabled={loading}
            style={[s.btnPrimary, loading && { opacity: 0.7 }]}
          >
            <Text style={s.btnPrimaryText}>
              {loading ? "Registrando..." : "Registrarse"}
            </Text>
          </TouchableOpacity>

          {/* Ir al login */}
          <TouchableOpacity onPress={goToLogin} style={s.btnSecondary}>
            <Text style={s.btnSecondaryText}>Ya tengo una cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    color: "#f9fafb",
    fontWeight: "900",
    letterSpacing: 4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#9ca3af",
    letterSpacing: 2,
  },
  form: {},
  label: {
    color: "#e5e7eb",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#e5ded4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  errorText: {
    marginTop: 8,
    color: "#f97373",
    fontSize: 13,
    fontWeight: "600",
  },
  btnPrimary: {
    marginTop: 24,
    backgroundColor: colors.teal || "#10b981",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 16,
  },
  btnSecondary: {
    marginTop: 12,
    backgroundColor: "#03323a",
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 14,
  },
});

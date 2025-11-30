import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { login } from "../lib/api";
import { colors } from "../constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const onLogin = async () => {
    if (loading) return;

    const e = email.trim();
    const p = password.trim();

    if (!e || !p) {
      Alert.alert("Campos incompletos", "Completa email y contraseña.");
      return;
    }

    if (!validEmail(e)) {
      Alert.alert("Email no válido", "Ingresa un correo válido.");
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();
      // login guarda el token en AsyncStorage (lib/api.ts)
      await login(e, p);
      // navega al home (ajusta la ruta si tu pantalla es otra)
      router.replace("/home");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "No se pudo iniciar sesión";
      Alert.alert("Error", String(msg));
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    if (loading) return;
    router.push("/register"); // pantalla de registro (app/register.tsx)
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <>
          <Text style={s.logo}>
            VERITEXT{"\n"}
            <Text style={s.logoSub}>STUDENT</Text>
          </Text>

          <View style={s.form}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#b8bcc7"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              style={s.input}
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#b8bcc7"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={onLogin}
              style={s.input}
            />

            <TouchableOpacity
              style={[s.btn, s.btnPrimary, loading && s.btnDisabled]}
              onPress={onLogin}
              disabled={loading}
            >
              <Text style={s.btnTxt}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btn, s.btnSecondary, loading && s.btnDisabled]}
              onPress={goToRegister}
              disabled={loading}
            >
              <Text style={s.btnTxt}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
    padding: 24,
    alignItems: "center",
  },
  logo: {
    color: "#E8F6FF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 80,
    marginBottom: 28,
    textAlign: "center",
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 14,
    letterSpacing: 2,
  },
  form: {
    gap: 12,
    width: "100%",
    maxWidth: 420,
  },
  input: {
    backgroundColor: "#ece5da",
    color: "#333",
    padding: 14,
    borderRadius: 12,
  },
  btn: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: colors.mint,
  },
  btnSecondary: {
    backgroundColor: colors.teal,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnTxt: {
    color: "#fff",
    fontWeight: "700",
  },
});

// app/upload.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { analyzeText } from "../lib/api";
import { decode as atob } from "base-64"; 


let pdfjsWeb: any | null = null;
let pdfjsNative: any | null = null;


const MIN_WORDS = 30; 

function countUsefulWords(text: string): number {

  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]/g, " ");
  const words = cleaned.trim().split(" ").filter(Boolean);
  return words.length;
}

async function getPdfJsWeb() {
  if (!pdfjsWeb) {

    pdfjsWeb = await import("pdfjs-dist/build/pdf");
    pdfjsWeb.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  return pdfjsWeb;
}

async function getPdfJsNative() {
  if (!pdfjsNative) {

    pdfjsNative = await import("pdfjs-dist/build/pdf");
  }
  return pdfjsNative;
}

export default function Upload() {
  const [fileName, setFileName] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // --------- Helpers PDF WEB ----------
  const extractPdfTextWeb = async (uri: string) => {
    const pdfjsLib = await getPdfJsWeb();
    const { getDocument } = pdfjsLib;

    const res = await fetch(uri);
    const arrayBuffer = await res.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text +=
        (content.items as any[])
          .map((t: any) => ("str" in t ? t.str : ""))
          .join(" ") + "\n";
    }
    return text;
  };

  // --------- Helpers PDF NATIVO ----------
  const extractPdfTextNative = async (uri: string) => {
    const pdfjsLib = await getPdfJsNative();
    const { getDocument } = pdfjsLib;


    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });


    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }

    const pdf = await getDocument({ data: bytes }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text +=
        (content.items as any[])
          .map((t: any) => ("str" in t ? t.str : ""))
          .join(" ") + "\n";
    }
    return text;
  };

  // ------------ selector de archivo -------------
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/plain", "application/pdf"],
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      setFileName(file.name || "archivo");

      setBusy(true);

      let content = "";
      const lowerName = (file.name || "").toLowerCase();
      const mime = file.mimeType || "";

      const isTxt = mime === "text/plain" || lowerName.endsWith(".txt");
      const isPdf = mime === "application/pdf" || lowerName.endsWith(".pdf");

      if (isTxt) {
        if (Platform.OS === "web") {
          const res = await fetch(file.uri);
          content = await res.text();
        } else {
          content = await FileSystem.readAsStringAsync(file.uri, {
            encoding: "utf8",
          });
        }
      } else if (isPdf) {
        content =
          Platform.OS === "web"
            ? await extractPdfTextWeb(file.uri)
            : await extractPdfTextNative(file.uri);
      } else {
        Alert.alert(
          "Formato no soportado",
          "Selecciona un archivo .txt o .pdf."
        );
        return;
      }

      if (!content.trim()) {
        Alert.alert("Archivo vacío", "El archivo no tiene texto legible.");
        return;
      }


      const nWords = countUsefulWords(content);
      if (nWords < MIN_WORDS) {
        Alert.alert(
          "No se pudo analizar",
          "El archivo parece contener solo imágenes o muy poco texto legible. Prueba con un PDF que tenga texto seleccionable."
        );
        return;
      }

      const data = await analyzeText(content);
      router.push({
        pathname: "/result",
        params: { payload: JSON.stringify(data) },
      });
    } catch (e: any) {
      console.error("UPLOAD ERROR", e);
      const msg = e?.message || "No se pudo leer o analizar el archivo.";
      Alert.alert("Error", String(msg));
    } finally {
      setBusy(false);
    }
  };

  const goHome = () => router.replace("/");

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={goHome} style={s.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#0f3b3a" />
        </TouchableOpacity>
        <Text style={s.title}>Subir archivo</Text>
      </View>

      <TouchableOpacity style={s.btn} onPress={pickFile} disabled={busy}>
        <Text style={s.btnText}>
          {busy ? "Procesando..." : "📂 Seleccionar archivo (.txt o .pdf)"}
        </Text>
      </TouchableOpacity>

      {fileName ? (
        <Text style={s.fileName}>Seleccionado: {fileName}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backBtn: { paddingRight: 8, paddingVertical: 2, marginRight: 6 },
  title: { fontSize: 28, fontWeight: "900", color: "#0f3b3a" },
  btn: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: "center",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  fileName: { marginTop: 16, color: "#555", textAlign: "center" },
});

// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Aseguramos que extraNodeModules exista
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  canvas: require.resolve("./canvas-shim.js"), // 👈 aquí el alias
};

module.exports = config;

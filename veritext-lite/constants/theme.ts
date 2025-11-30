// constants/theme.ts

// 🎨 Paleta base que usarás en componentes simples
const baseColors = {
  navy: "#0C1326",
  teal: "#0f3b3a",
  mint: "#1ABC9C",
  cream: "#F4EDE4",
  chip: "#E9ECF5",
  text: "#0e2f35",
  danger: "#E75C5C",

  // Donut
  donutPink: "#F06292",
  donutYellow: "#F4C542",
  donutBlue: "#5BA4D8",
};

// 👉 Export para componentes sencillos (como BackHeader)
export const colors = baseColors;

// 👉 Objeto Colors con variantes light/dark para useThemeColor
const Colors = {
  light: {
    ...baseColors,
    background: "#FFFFFF",
  },
  dark: {
    ...baseColors,
    background: "#0C1326",
  },
};

export default Colors;

export type ThemeColorName = keyof typeof Colors.light;

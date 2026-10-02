import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0F2F5",

    text: "#111827",
    textSecondary: "#6B7280",
    textTertiary: "#9CA3AF",

    primary: "#2563EB",
    primarySoft: "#E8F0FE",

    success: "#16A34A",
    successSoft: "#EAF7EE",

    warning: "#D97706",
    warningSoft: "#FFF4E5",

    danger: "#DC2626",
    dangerSoft: "#FDECEC",

    border: "#E5E7EB",
  },

  dark: {
    background: "#0F1115",
    surface: "#181B21",
    surfaceSecondary: "#22262E",

    text: "#F9FAFB",
    textSecondary: "#A1A1AA",
    textTertiary: "#71717A",

    primary: "#60A5FA",
    primarySoft: "#1E3A5F",

    success: "#4ADE80",
    successSoft: "#163A25",

    warning: "#FBBF24",
    warningSoft: "#3D3014",

    danger: "#F87171",
    dangerSoft: "#421B1B",

    border: "#2D323B",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export const FontSize = {
  small: 12,
  body: 15,
  bodyLarge: 17,
  title: 24,
  largeTitle: 30,
  amount: 28,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radius = {
  small: 8,
  medium: 12,
  large: 18,
  pill: 999,
} as const;

export const IconSize = {
  small: 18,
  medium: 22,
  large: 28,
  xlarge: 34,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;

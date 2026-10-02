import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#F6F8F7",
    surface: "#FFFFFF",
    surfaceSecondary: "#EEF3F0",
    text: "#10231B",
    textSecondary: "#617169",
    textTertiary: "#97A39D",
    primary: "#059669",
    primarySoft: "#E6F7F0",
    success: "#059669",
    successSoft: "#E6F7F0",
    warning: "#D97706",
    warningSoft: "#FFF3DF",
    terracotta: "#C96A4A",
    terracottaSoft: "#FCECE6",
    danger: "#DC2626",
    dangerSoft: "#FDECEC",
    border: "#DCE5E0",
  },
  dark: {
    background: "#0B1511",
    surface: "#12201A",
    surfaceSecondary: "#1B2C24",
    text: "#F4FAF7",
    textSecondary: "#A6B7AF",
    textTertiary: "#71827A",
    primary: "#34D399",
    primarySoft: "#143E30",
    success: "#34D399",
    successSoft: "#143E30",
    warning: "#FBBF24",
    warningSoft: "#3A2D10",
    terracotta: "#F08A66",
    terracottaSoft: "#422219",
    danger: "#F87171",
    dangerSoft: "#421B1B",
    border: "#294037",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceSecondary: "#F3F6F4",
    text: "#10231B",
    textSecondary: "#617169",
    textTertiary: "#97A39D",
    primary: "#087F5B",
    primarySoft: "#DDF5EC",
    success: "#16A36F",
    successSoft: "#E1F6ED",
    warning: "#D98A24",
    warningSoft: "#FFF1D8",
    terracotta: "#C76B4B",
    terracottaSoft: "#FBE9E3",
    danger: "#DC2626",
    dangerSoft: "#FDECEC",
    border: "#D7E2DC",
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
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extraBold: "Inter_800ExtraBold",
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

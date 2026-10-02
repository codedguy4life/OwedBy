import Svg, { Circle, Path, Rect } from "react-native-svg";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

export function OwedByLogo({ size = 40 }: { size?: number }) {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect x="6" y="4" width="30" height="40" rx="7" fill={colors.primary} />
      <Path d="M14 15h14M14 21h14M14 27h8" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <Circle cx="34" cy="34" r="9" fill={colors.surface} stroke={colors.primary} strokeWidth="2.5" />
      <Path d="M30.5 34l2.2 2.2 4.8-5" stroke={colors.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

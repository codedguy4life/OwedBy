import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors, Fonts } from "@/constants/theme";

const items = [
  { label: "Home", path: "/", outline: "home-outline", filled: "home" },
  { label: "People", path: "/people", outline: "people-outline", filled: "people" },
  { label: "Activity", path: "/activity", outline: "time-outline", filled: "time" },
  { label: "Insights", path: "/insights", outline: "pie-chart-outline", filled: "pie-chart" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const active = pathname === "/" ? "/" : "/" + pathname.split("/")[1];

  return (
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {items.map((item) => (
          <Pressable
            key={item.path}
            onPress={() => router.replace(item.path as never)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === item.path }}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.65 : 1 }]}
          >
            <View style={[styles.iconWrap, active === item.path && { backgroundColor: colors.primarySoft }]}>
              <Ionicons
                name={(active === item.path ? item.filled : item.outline) as never}
                size={20}
                color={active === item.path ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[styles.label, { color: active === item.path ? colors.primary : colors.textSecondary }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingBottom: 10 },
  bar: {
    height: 68,
    borderWidth: 1,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 7,
    elevation: 12,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  item: { flex: 1, height: 58, alignItems: "center", justifyContent: "center", gap: 3 },
  iconWrap: { width: 38, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: Fonts.medium, fontSize: 9.5 },
});

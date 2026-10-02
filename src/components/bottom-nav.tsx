import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors, Fonts } from "@/constants/theme";

const items = [
  { label: "Home", path: "/", icon: "home-outline", active: "home" },
  { label: "People", path: "/people", icon: "people-outline", active: "people" },
  { label: "Activity", path: "/activity", icon: "time-outline", active: "activity" },
  { label: "Insights", path: "/insights", icon: "pie-chart-outline", active: "insights" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const active = pathname === "/" ? "home" : pathname.split("/")[1] || "home";

  return (
    <View style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {items.slice(0, 2).map((item) => (
        <Pressable key={item.label} onPress={() => router.replace(item.path as never)} style={styles.item}>
          <Ionicons name={(active === item.active ? item.icon.replace("-outline", "") : item.icon) as never} size={22} color={active === item.active ? colors.primary : colors.textSecondary} />
          <Text style={[styles.label, { color: active === item.active ? colors.primary : colors.textSecondary }]}>{item.label}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => router.push("/add-debt")} style={[styles.add, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
      {items.slice(2).map((item) => (
        <Pressable key={item.label} onPress={() => router.replace(item.path as never)} style={styles.item}>
          <Ionicons name={(active === item.active ? item.icon.replace("-outline", "") : item.icon) as never} size={22} color={active === item.active ? colors.primary : colors.textSecondary} />
          <Text style={[styles.label, { color: active === item.active ? colors.primary : colors.textSecondary }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 76, borderTopWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingHorizontal: 8 },
  item: { width: 70, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { fontFamily: Fonts.medium, fontSize: 10 },
  add: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginTop: -24, borderWidth: 4, borderColor: "#fff" },
});

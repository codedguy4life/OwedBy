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
    <View style={[styles.shell, { backgroundColor: colors.surface }]}>
      <View style={[styles.bar, { borderColor: colors.border }]}>
        {items.slice(0, 2).map((item) => (
          <NavItem key={item.path} item={item} active={active === item.path} colors={colors} />
        ))}
        <Pressable
          onPress={() => router.push("/add-debt")}
          accessibilityRole="button"
          accessibilityLabel="Add debt"
          style={({ pressed }) => [
            styles.add,
            { backgroundColor: colors.primary, borderColor: colors.surface, transform: [{ scale: pressed ? 0.94 : 1 }] },
          ]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
        {items.slice(2).map((item) => (
          <NavItem key={item.path} item={item} active={active === item.path} colors={colors} />
        ))}
      </View>
    </View>
  );
}

function NavItem({ item, active, colors }: { item: (typeof items)[number]; active: boolean; colors: (typeof Colors)["light"] }) {
  return (
    <Pressable
      onPress={() => router.replace(item.path as never)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.item, { opacity: pressed ? 0.65 : 1 }]}
    >
      <View style={[styles.iconWrap, active && { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={(active ? item.filled : item.outline) as never} size={20} color={active ? colors.primary : colors.textSecondary} />
      </View>
      <Text style={[styles.label, { color: active ? colors.primary : colors.textSecondary }]}>{item.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingBottom: 10 },
  bar: {
    height: 70,
    borderWidth: 1,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 4,
    elevation: 14,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
  },
  item: { width: 62, height: 58, alignItems: "center", justifyContent: "center", gap: 2 },
  iconWrap: { width: 38, height: 30, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  label: { fontFamily: Fonts.medium, fontSize: 9 },
  add: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -26,
    borderWidth: 4,
    elevation: 10,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
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
    <View style={[styles.bar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {items.slice(0, 2).map((item) => (
        <Pressable key={item.path} onPress={() => router.replace(item.path as never)} style={styles.item}>
          <Ionicons name={(active === item.path ? item.filled : item.outline) as never} size={21} color={active === item.path ? colors.primary : colors.textSecondary} />
          <Text style={[styles.label, { color: active === item.path ? colors.primary : colors.textSecondary }]}>{item.label}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => router.push("/add-debt")} style={({ pressed }) => [styles.add, { backgroundColor: colors.primary, borderColor: colors.surface, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
        <Ionicons name="add" size={27} color="#fff" />
      </Pressable>
      {items.slice(2).map((item) => (
        <Pressable key={item.path} onPress={() => router.replace(item.path as never)} style={styles.item}>
          <Ionicons name={(active === item.path ? item.filled : item.outline) as never} size={21} color={active === item.path ? colors.primary : colors.textSecondary} />
          <Text style={[styles.label, { color: active === item.path ? colors.primary : colors.textSecondary }]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  bar:{position:"absolute",left:0,right:0,bottom:0,height:78,borderTopWidth:1,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingHorizontal:8,elevation:12,shadowOpacity:.08,shadowRadius:10,shadowOffset:{width:0,height:-3}},
  item:{width:62,alignItems:"center",justifyContent:"center",gap:4},
  label:{fontFamily:Fonts.medium,fontSize:9},
  add:{width:58,height:58,borderRadius:29,alignItems:"center",justifyContent:"center",marginTop:-27,borderWidth:4,elevation:8,shadowOpacity:.16,shadowRadius:8,shadowOffset:{width:0,height:3}}
});
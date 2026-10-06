import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";
import { remainingAmount } from "@/types/debt";

export default function PeopleScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { debts } = useDebts();
  const [query, setQuery] = useState("");

  const people = useMemo(() => {
    const grouped = new Map<string, typeof debts>();
    debts.forEach((debt) => {
      const key = debt.person.trim().toLowerCase();
      grouped.set(key, [...(grouped.get(key) ?? []), debt]);
    });
    return [...grouped.values()]
      .map((items) => ({
        person: items[0].person,
        items,
        open: items.filter((d) => remainingAmount(d) > 0),
        currencies: [...new Set(items.filter((d) => remainingAmount(d) > 0).map((d) => d.currency))],
      }))
      .filter((p) => p.person.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => a.person.localeCompare(b.person));
  }, [debts, query]);

  const activePeople = people.filter((p) => p.open.length > 0).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>YOUR MONEY CIRCLE</Text>
            <Text style={[styles.title, { color: colors.text }]}>People</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Everyone connected to your money.</Text>
          </View>
          <View style={[styles.countBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.count, { color: colors.text }]}>{activePeople}</Text>
            <Text style={[styles.countLabel, { color: colors.textTertiary }]}>active</Text>
          </View>
        </View>

        <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={19} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query ? <Pressable onPress={() => setQuery("")}><Ionicons name="close-circle" size={18} color={colors.textTertiary} /></Pressable> : null}
        </View>

        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroIcon}><Ionicons name="people-outline" size={21} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroEyebrow}>PERSONAL LEDGER</Text>
            <Text style={styles.heroTitle}>Keep every balance in one place.</Text>
          </View>
          <Ionicons name="sparkles-outline" size={18} color="rgba(255,255,255,.8)" />
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your people</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Open balances by person</Text>
          </View>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>{people.length}</Text>
        </View>

        {people.length ? people.map((person) => {
          const firstOpen = person.open[0] ?? person.items[0];
          const accent = firstOpen?.type === "they_owe_me" ? colors.success : colors.terracotta;
          const soft = firstOpen?.type === "they_owe_me" ? colors.successSoft : colors.terracottaSoft;
          const paymentCount = person.items.reduce((sum, d) => sum + d.payments.length, 0);
          return (
            <Pressable
              key={person.person.toLowerCase()}
              onPress={() => router.push({ pathname: "/debt/[id]", params: { id: firstOpen.id } })}
              style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.88 : 1 }]}
            >
              <View style={[styles.avatar, { backgroundColor: soft }]}>
                <Text style={[styles.initial, { color: accent }]}>{person.person.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.personInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{person.person}</Text>
                  {person.open.length === 0 ? (
                    <View style={[styles.settled, { backgroundColor: colors.successSoft }]}>
                      <Ionicons name="checkmark" size={10} color={colors.success} />
                      <Text style={[styles.settledText, { color: colors.success }]}>Settled</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.meta, { color: colors.textSecondary }]}>{person.items.length} debt{person.items.length === 1 ? "" : "s"} · {paymentCount} payment{paymentCount === 1 ? "" : "s"}</Text>
                <View style={styles.amounts}>
                  {person.currencies.map((currency) => {
                    const total = person.open.filter((d) => d.currency === currency).reduce((sum, d) => sum + remainingAmount(d), 0);
                    return <Text key={currency} style={[styles.amount, { color: accent }]}>{formatMoney(total, currency)}</Text>;
                  })}
                </View>
              </View>
              <View style={styles.chevron}><Ionicons name="chevron-forward" size={17} color={colors.textTertiary} /></View>
            </Pressable>
          );
        }) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="people-outline" size={25} color={colors.primary} /></View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{query ? "No people found" : "Your people ledger is empty"}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{query ? "Try another name." : "Add your first debt and the person will appear here."}</Text>
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 30, paddingBottom: 112 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  kicker: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  title: { fontFamily: Fonts.extraBold, fontSize: 31, marginTop: 3 },
  sub: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 4 },
  countBubble: { minWidth: 62, paddingVertical: 10, paddingHorizontal: 9, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  count: { fontFamily: Fonts.extraBold, fontSize: 18 },
  countLabel: { fontFamily: Fonts.medium, fontSize: 9, marginTop: 1 },
  search: { height: 50, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 13 },
  searchInput: { flex: 1, marginLeft: 9, fontFamily: Fonts.regular, fontSize: 14 },
  hero: { marginTop: 12, minHeight: 86, borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center", gap: 11 },
  heroIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,.14)", alignItems: "center", justifyContent: "center" },
  heroEyebrow: { color: "rgba(255,255,255,.64)", fontFamily: Fonts.bold, fontSize: 8, letterSpacing: 1 },
  heroTitle: { color: "#fff", fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 3 },
  sectionHead: { marginTop: 23, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 19 },
  sectionSub: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  sectionCount: { fontFamily: Fonts.bold, fontSize: 11 },
  card: { minHeight: 96, borderRadius: 19, borderWidth: 1, padding: 13, marginBottom: 9, flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  initial: { fontFamily: Fonts.extraBold, fontSize: 18 },
  personInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  name: { fontFamily: Fonts.semiBold, fontSize: 14, flexShrink: 1 },
  settled: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 2 },
  settledText: { fontFamily: Fonts.bold, fontSize: 8 },
  meta: { fontFamily: Fonts.regular, fontSize: 10, marginTop: 4 },
  amounts: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 7 },
  amount: { fontFamily: Fonts.bold, fontSize: 12 },
  chevron: { width: 28, height: 28, borderRadius: 10, backgroundColor: "rgba(127,127,127,.07)", alignItems: "center", justifyContent: "center" },
  empty: { borderRadius: 19, borderWidth: 1, padding: 30, alignItems: "center", marginTop: 4 },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", marginBottom: 11 },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 16 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, textAlign: "center", maxWidth: 290, marginTop: 4 },
});
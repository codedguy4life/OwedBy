import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";
import { remainingAmount } from "@/types/debt";

type Filter = "all" | "they_owe_me" | "i_owe_them";

export default function PeopleScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { debts } = useDebts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const grouped = useMemo(() => {
    const map = new Map<string, typeof debts>();
    debts.forEach((debt) => {
      const key = debt.person.trim().toLowerCase();
      map.set(key, [...(map.get(key) ?? []), debt]);
    });

    return [...map.entries()].map(([key, items]) => {
      const open = items.filter((d) => remainingAmount(d) > 0);
      const incoming = open.filter((d) => d.type === "they_owe_me");
      const outgoing = open.filter((d) => d.type === "i_owe_them");
      const latest = [...items].sort((a, b) => {
        const aDate = Math.max(
          new Date(a.createdAt || 0).getTime(),
          ...a.payments.map((p) => new Date(p.date || 0).getTime())
        );
        const bDate = Math.max(
          new Date(b.createdAt || 0).getTime(),
          ...b.payments.map((p) => new Date(p.date || 0).getTime())
        );
        return bDate - aDate;
      })[0];

      return {
        key,
        person: items[0].person,
        items,
        open,
        incoming,
        outgoing,
        latest,
      };
    });
  }, [debts]);

  const matchesFilter = (person: (typeof grouped)[number]) => {
    if (filter === "they_owe_me") return person.incoming.length > 0;
    if (filter === "i_owe_them") return person.outgoing.length > 0;
    return person.open.length > 0;
  };

  const people = useMemo(
    () =>
      grouped
        .filter(matchesFilter)
        .filter((person) => person.person.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => a.person.localeCompare(b.person)),
    [grouped, filter, query]
  );

  const activePeople = grouped.filter((p) => p.open.length > 0).length;
  const incomingPeople = grouped.filter((p) => p.incoming.length > 0).length;
  const outgoingPeople = grouped.filter((p) => p.outgoing.length > 0).length;

  const totals = (items: typeof debts) => {
    const map = new Map<string, number>();
    items.filter((d) => remainingAmount(d) > 0).forEach((d) => {
      map.set(d.currency, (map.get(d.currency) ?? 0) + remainingAmount(d));
    });
    return [...map.entries()];
  };

  const lastActivity = (value?: string) =>
    value
      ? new Date(value).toLocaleDateString("en-NG", { month: "short", day: "numeric" })
      : "No activity";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>YOUR MONEY CIRCLE</Text>
            <Text style={[styles.title, { color: colors.text }]}>People</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{activePeople} active contacts</Text>
          </View>
          <View style={[styles.countBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={17} color={colors.primary} />
            <Text style={[styles.countNumber, { color: colors.text }]}>{activePeople}</Text>
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
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.filterBar, { backgroundColor: colors.surfaceSecondary }]}>
          {[
            ["all", "All", activePeople],
            ["they_owe_me", "They owe", incomingPeople],
            ["i_owe_them", "You owe", outgoingPeople],
          ].map(([value, label, count]) => {
            const selected = filter === value;
            return (
              <Pressable
                key={value}
                onPress={() => setFilter(value as Filter)}
                style={[
                  styles.filterButton,
                  selected && { backgroundColor: colors.surface, shadowOpacity: 0.06 },
                ]}
              >
                <Text style={[styles.filterLabel, { color: selected ? colors.text : colors.textSecondary }]}>
                  {label}
                </Text>
                <View style={[styles.filterCount, { backgroundColor: selected ? colors.primarySoft : colors.surface }]}>
                  <Text style={[styles.filterCountText, { color: selected ? colors.primary : colors.textTertiary }]}>{count}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="arrow-down" size={17} color={colors.success} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>To collect</Text>
            {totals(debts.filter((d) => d.type === "they_owe_me")).map(([currency, total]) => (
              <Text key={currency} style={[styles.summaryAmount, { color: colors.text }]}>{formatMoney(total, currency)}</Text>
            ))}
            <Text style={[styles.summaryCaption, { color: colors.textTertiary }]}>{incomingPeople} people owe you</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="arrow-up" size={17} color={colors.warning} />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>To settle</Text>
            {totals(debts.filter((d) => d.type === "i_owe_them")).map(([currency, total]) => (
              <Text key={currency} style={[styles.summaryAmount, { color: colors.text }]}>{formatMoney(total, currency)}</Text>
            ))}
            <Text style={[styles.summaryCaption, { color: colors.textTertiary }]}>{outgoingPeople} people you owe</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your people</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Contacts with an open balance.</Text>
          </View>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>{people.length}</Text>
        </View>

        {people.length ? (
          people.map((person) => {
            const primaryDebt = person.open[0] ?? person.items[0];
            const incoming = person.incoming.length > 0 && person.outgoing.length === 0;
            const accent = incoming ? colors.success : colors.terracotta;
            const soft = incoming ? colors.successSoft : colors.terracottaSoft;
            const balances = totals(person.open);
            const paymentCount = person.items.reduce((sum, d) => sum + d.payments.length, 0);
            const latestDate = person.latest
              ? Math.max(
                  new Date(person.latest.createdAt || 0).getTime(),
                  ...person.latest.payments.map((p) => new Date(p.date || 0).getTime())
                )
              : 0;

            return (
              <Pressable
                key={person.key}
                onPress={() => router.push({ pathname: "/debt/[id]", params: { id: primaryDebt.id } })}
                style={({ pressed }) => [
                  styles.personCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.86 : 1 },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: soft }]}>
                  <Text style={[styles.initials, { color: accent }]}>
                    {person.person.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()}
                  </Text>
                </View>

                <View style={styles.personInfo}>
                  <Text style={[styles.personName, { color: colors.text }]} numberOfLines={1}>{person.person}</Text>
                  <Text style={[styles.records, { color: colors.textSecondary }]}>
                    {person.items.length} record{person.items.length === 1 ? "" : "s"} · {paymentCount} payment{paymentCount === 1 ? "" : "s"} · Last activity {lastActivity(latestDate ? new Date(latestDate).toISOString() : undefined)}
                  </Text>
                  <View style={styles.balanceRow}>
                    {balances.map(([currency, total]) => (
                      <View key={currency} style={[styles.balancePill, { backgroundColor: soft }]}>
                        <Text style={[styles.balanceText, { color: accent }]}>{formatMoney(total, currency)}</Text>
                      </View>
                    ))}
                    {person.incoming.length > 0 && person.outgoing.length > 0 ? (
                      <Text style={[styles.mixedText, { color: colors.textTertiary }]}>mixed</Text>
                    ) : (
                      <Text style={[styles.roleText, { color: accent }]}>{incoming ? "Receivable" : "Payable"}</Text>
                    )}
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
              </Pressable>
            );
          })
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="people-outline" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{query ? "No people found" : "No open contacts"}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {query ? "Try another name." : "Add a debt and the person will appear here."}
            </Text>
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
  header: { flexDirection: "row", alignItems: "flex-start", marginBottom: 18 },
  kicker: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  title: { fontFamily: Fonts.extraBold, fontSize: 31, marginTop: 3 },
  sub: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 4 },
  countBox: { minWidth: 60, height: 60, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 2 },
  countNumber: { fontFamily: Fonts.extraBold, fontSize: 19 },
  search: { height: 50, borderRadius: 15, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row", alignItems: "center" },
  searchInput: { flex: 1, marginLeft: 9, fontFamily: Fonts.regular, fontSize: 14 },
  filterBar: { marginTop: 12, padding: 4, borderRadius: 17, flexDirection: "row", gap: 4 },
  filterButton: { flex: 1, minHeight: 42, borderRadius: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  filterLabel: { fontFamily: Fonts.semiBold, fontSize: 10 },
  filterCount: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  filterCountText: { fontFamily: Fonts.bold, fontSize: 9 },
  summaryGrid: { flexDirection: "row", gap: 10, marginTop: 12 },
  summaryCard: { flex: 1, minHeight: 143, borderRadius: 19, borderWidth: 1, padding: 14 },
  summaryIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryLabel: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 11 },
  summaryAmount: { fontFamily: Fonts.extraBold, fontSize: 19, marginTop: 4 },
  summaryCaption: { fontFamily: Fonts.regular, fontSize: 9, marginTop: 5 },
  sectionHeader: { marginTop: 23, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 19 },
  sectionSub: { fontFamily: Fonts.regular, fontSize: 10, marginTop: 3 },
  sectionCount: { fontFamily: Fonts.bold, fontSize: 11 },
  personCard: { minHeight: 92, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: "row", alignItems: "center", marginBottom: 9 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  initials: { fontFamily: Fonts.extraBold, fontSize: 15 },
  personInfo: { flex: 1, marginLeft: 11, marginRight: 7 },
  personName: { fontFamily: Fonts.semiBold, fontSize: 14 },
  records: { fontFamily: Fonts.regular, fontSize: 9, marginTop: 4 },
  balanceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 5, marginTop: 7 },
  balancePill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  balanceText: { fontFamily: Fonts.bold, fontSize: 10 },
  roleText: { fontFamily: Fonts.bold, fontSize: 9 },
  mixedText: { fontFamily: Fonts.medium, fontSize: 9 },
  empty: { marginTop: 5, borderRadius: 19, borderWidth: 1, padding: 32, alignItems: "center" },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 11 },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 16 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, textAlign: "center", maxWidth: 280, marginTop: 4 },
});

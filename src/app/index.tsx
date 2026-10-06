import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { OwedByLogo } from "@/components/owedby-logo";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";
import { remainingAmount } from "@/types/debt";

const dueInfo = (value?: string) => {
  if (!value) return { label: "No due date", tone: "neutral" as const };
  const due = new Date(value);
  const today = new Date();
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const b = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const days = Math.round((b - a) / 86400000);
  if (days < 0) return { label: "Overdue", tone: "danger" as const };
  if (days === 0) return { label: "Due today", tone: "danger" as const };
  return { label: `Due ${due.toLocaleDateString("en-NG", { month: "short", day: "numeric" })}`, tone: days <= 7 ? "warning" as const : "neutral" as const };
};

export default function HomeScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { debts, loading } = useDebts();
  const open = useMemo(() => debts.filter((d) => remainingAmount(d) > 0), [debts]);
  const incoming = open.filter((d) => d.type === "they_owe_me");
  const outgoing = open.filter((d) => d.type === "i_owe_them");
  const people = (items: typeof debts) => new Set(items.map((d) => d.person.trim().toLowerCase())).size;
  const totals = (items: typeof debts) => {
    const map = new Map<string, number>();
    items.forEach((d) => map.set(d.currency, (map.get(d.currency) ?? 0) + remainingAmount(d)));
    return [...map.entries()];
  };
  const recent = useMemo(() => [...debts].sort((a,b) => new Date(b.createdAt || b.borrowedDate || 0).getTime() - new Date(a.createdAt || a.borrowedDate || 0).getTime()).slice(0, 6), [debts]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <OwedByLogo size={34} />
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>Good morning 👋</Text>
              <Text style={[styles.brand, { color: colors.textSecondary }]}>Your personal ledger</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push("/settings")} style={[styles.settings, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.text }]}>OwedBy</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your money notebook.</Text>
        </View>

        <View style={styles.summaryStack}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="arrow-down" size={15} color={colors.success} />
            </View>
            <View style={styles.summaryMain}>
              <View style={styles.summaryTitleRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>People owe you</Text>
                <View style={[styles.countPill, { backgroundColor: colors.successSoft }]}>
                  <Text style={[styles.countText, { color: colors.success }]}>{people(incoming)} incoming</Text>
                  <Ionicons name="chevron-down" size={10} color={colors.success} />
                </View>
              </View>
              <View style={styles.moneyLine}>
                {totals(incoming).map(([currency, total]) => <Text key={currency} style={[styles.amount, { color: colors.text }]}>{formatMoney(total, currency)}</Text>)}
                <Text style={[styles.role, { color: colors.success }]}>Receivable</Text>
              </View>
            </View>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="arrow-up" size={15} color={colors.warning} />
            </View>
            <View style={styles.summaryMain}>
              <View style={styles.summaryTitleRow}>
                <Text style={[styles.summaryLabel, { color: colors.text }]}>People you owe</Text>
                <View style={[styles.countPill, { backgroundColor: colors.warningSoft }]}>
                  <Text style={[styles.countText, { color: colors.warning }]}>{people(outgoing)} outgoing</Text>
                  <Ionicons name="chevron-down" size={10} color={colors.warning} />
                </View>
              </View>
              <View style={styles.moneyLine}>
                {totals(outgoing).map(([currency, total]) => <Text key={currency} style={[styles.amount, { color: colors.text }]}>{formatMoney(total, currency)}</Text>)}
                <Text style={[styles.role, { color: colors.warning }]}>Payable</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent transactions</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>Latest entries in your ledger</Text>
          </View>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>{recent.length}</Text>
        </View>

        {loading ? (
          <View style={[styles.empty, { backgroundColor: colors.surface }]}><Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading…</Text></View>
        ) : recent.length ? (
          <View style={[styles.history, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {recent.map((debt, index) => {
              const incomingDebt = debt.type === "they_owe_me";
              const accent = incomingDebt ? colors.success : colors.terracotta;
              const soft = incomingDebt ? colors.successSoft : colors.terracottaSoft;
              const due = dueInfo(debt.dueDate);
              const dueColor = due.tone === "danger" ? colors.danger : due.tone === "warning" ? colors.warning : colors.textTertiary;
              return (
                <Pressable key={debt.id} onPress={() => router.push({ pathname: "/debt/[id]", params: { id: debt.id } })} style={[styles.transaction, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <View style={[styles.avatar, { backgroundColor: soft }]}><Text style={[styles.avatarText, { color: accent }]}>{debt.person.trim().charAt(0).toUpperCase()}</Text></View>
                  <View style={styles.transactionInfo}>
                    <View style={styles.nameLine}>
                      <Text style={[styles.person, { color: colors.text }]} numberOfLines={1}>{debt.person}</Text>
                      <Text style={[styles.category, { color: colors.textTertiary }]} numberOfLines={1}>{debt.category}</Text>
                    </View>
                    <View style={styles.detailLine}>
                      <Text style={[styles.direction, { color: accent }]} numberOfLines={1}>{incomingDebt ? "You lent" : "You owe"}</Text>
                      <Text style={[styles.role, { color: colors.textSecondary }]} numberOfLines={1}>{incomingDebt ? "Receivable" : "Payable"}</Text>
                      <Text style={[styles.due, { color: dueColor }]} numberOfLines={1}>{due.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.amountRight, { color: colors.text }]} numberOfLines={1}>{formatMoney(remainingAmount(debt), debt.currency)}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={25} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Add your first debt to start your ledger.</Text>
          </View>
        )}

        <Pressable onPress={() => router.push("/add-debt")} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addText}>Add debt</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 22, paddingBottom: 104 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  identity: { flexDirection: "row", alignItems: "center", gap: 9 },
  greeting: { fontFamily: Fonts.bold, fontSize: 16 },
  brand: { fontFamily: Fonts.medium, fontSize: 10, marginTop: 1 },
  settings: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  heading: { marginTop: 15, marginBottom: 11 },
  title: { fontFamily: Fonts.extraBold, fontSize: 25 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 10, marginTop: 2 },
  summaryStack: { gap: 8 },
  summaryCard: { minHeight: 70, borderRadius: 15, borderWidth: 1, padding: 11, flexDirection: "row", alignItems: "center", gap: 10 },
  summaryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  summaryMain: { flex: 1, minWidth: 0 },
  summaryTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  summaryLabel: { fontFamily: Fonts.semiBold, fontSize: 12, flexShrink: 1 },
  countPill: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 1, flexShrink: 0 },
  countText: { fontFamily: Fonts.bold, fontSize: 7 },
  moneyLine: { flexDirection: "row", alignItems: "baseline", gap: 7, marginTop: 5, flexWrap: "nowrap" },
  amount: { fontFamily: Fonts.extraBold, fontSize: 17 },
  role: { fontFamily: Fonts.bold, fontSize: 8, flexShrink: 0 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", marginTop: 17, marginBottom: 7 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 16 },
  sectionSub: { fontFamily: Fonts.regular, fontSize: 9, marginTop: 2 },
  sectionCount: { fontFamily: Fonts.bold, fontSize: 10 },
  history: { borderRadius: 15, borderWidth: 1, overflow: "hidden" },
  transaction: { minHeight: 76, paddingHorizontal: 12, paddingVertical: 11, flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.extraBold, fontSize: 14 },
  transactionInfo: { flex: 1, minWidth: 0, marginLeft: 9, marginRight: 7 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 },
  person: { fontFamily: Fonts.semiBold, fontSize: 12, flexShrink: 1 },
  category: { fontFamily: Fonts.medium, fontSize: 9, maxWidth: 70 },
  detailLine: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "nowrap" },
  direction: { fontFamily: Fonts.bold, fontSize: 9, flexShrink: 1 },
  role: { fontFamily: Fonts.medium, fontSize: 9, flexShrink: 1 },
  due: { fontFamily: Fonts.medium, fontSize: 9, flexShrink: 1 },
  amountRight: { fontFamily: Fonts.bold, fontSize: 12, maxWidth: 100 },
  addButton: { height: 50, borderRadius: 15, marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  addText: { color: "#fff", fontFamily: Fonts.bold, fontSize: 13 },
  empty: { borderRadius: 15, borderWidth: 1, padding: 24, alignItems: "center" },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 14, marginTop: 8 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 10, marginTop: 3 },
});

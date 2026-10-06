import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { OwedByLogo } from "@/components/owedby-logo";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";
import { remainingAmount } from "@/types/debt";

const dayKey = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const openDebts = useMemo(
    () => debts.filter((d) => remainingAmount(d) > 0),
    [debts]
  );

  const incoming = useMemo(() => openDebts.filter((d) => d.type === "they_owe_me"), [openDebts]);
  const outgoing = useMemo(() => openDebts.filter((d) => d.type === "i_owe_them"), [openDebts]);

  const countPeople = (items: typeof debts) =>
    new Set(items.map((d) => d.person.trim().toLowerCase())).size;

  const currencyTotal = (items: typeof debts) => {
    const totals = new Map<string, number>();
    items.forEach((d) => totals.set(d.currency, (totals.get(d.currency) ?? 0) + remainingAmount(d)));
    return [...totals.entries()];
  };

  const recent = useMemo(
    () =>
      [...debts]
        .sort((a, b) => {
          const ad = new Date(a.createdAt || a.borrowedDate || 0).getTime();
          const bd = new Date(b.createdAt || b.borrowedDate || 0).getTime();
          return bd - ad;
        })
        .slice(0, 8),
    [debts]
  );

  const selectedDayTransactions = useMemo(
    () => recent.filter((d) => dayKey(d.createdAt || d.borrowedDate) === dayKey(selectedDate.toISOString())),
    [recent, selectedDate]
  );

  const history = selectedDayTransactions.length ? selectedDayTransactions : recent;

  const renderTotals = (items: typeof debts) =>
    currencyTotal(items).map(([currency, total]) => (
      <Text key={currency} style={[styles.summaryAmount, { color: colors.text }]}>
        {formatMoney(total, currency)}
      </Text>
    ));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <OwedByLogo size={42} />
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>Good morning 👋</Text>
              <Text style={[styles.brand, { color: colors.textSecondary }]}>Your personal ledger</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            style={[styles.settings, { backgroundColor: colors.surface, borderColor: colors.border }]}
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>OwedBy</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Keep every promise on paper, without the paper.</Text>
          </View>
        </View>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.dateIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateLabel, { color: colors.textTertiary }]}>SELECT DATE</Text>
            <Text style={[styles.dateValue, { color: colors.text }]}>{formatDate(selectedDate)}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>

        {showDatePicker ? (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            onValueChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
            onDismiss={() => setShowDatePicker(false)}
            presentation="dialog"
          />
        ) : null}

        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryTop}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}>
                <Ionicons name="arrow-down" size={17} color={colors.success} />
              </View>
              <View style={[styles.countPill, { backgroundColor: colors.successSoft }]}>
                <Text style={[styles.countText, { color: colors.success }]}>{countPeople(incoming)} incoming</Text>
                <Ionicons name="chevron-down" size={12} color={colors.success} />
              </View>
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>People owe you</Text>
            {renderTotals(incoming)}
            <Text style={[styles.summaryCaption, { color: colors.textTertiary }]}>Receivable</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.summaryTop}>
              <View style={[styles.summaryIcon, { backgroundColor: colors.warningSoft }]}>
                <Ionicons name="arrow-up" size={17} color={colors.warning} />
              </View>
              <View style={[styles.countPill, { backgroundColor: colors.warningSoft }]}>
                <Text style={[styles.countText, { color: colors.warning }]}>{countPeople(outgoing)} ending</Text>
                <Ionicons name="chevron-down" size={12} color={colors.warning} />
              </View>
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>People you owe</Text>
            {renderTotals(outgoing)}
            <Text style={[styles.summaryCaption, { color: colors.textTertiary }]}>Payable</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent transactions</Text>
            <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
              {selectedDayTransactions.length ? `Activity on ${formatDate(selectedDate)}` : "Your latest ledger entries"}
            </Text>
          </View>
          <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>{history.length}</Text>
        </View>

        {loading ? (
          <View style={[styles.empty, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading your notebook…</Text>
          </View>
        ) : history.length ? (
          <View style={[styles.history, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {history.map((debt, index) => {
              const incomingDebt = debt.type === "they_owe_me";
              const accent = incomingDebt ? colors.success : colors.terracotta;
              const soft = incomingDebt ? colors.successSoft : colors.terracottaSoft;
              const due = dueInfo(debt.dueDate);
              const dueColor = due.tone === "danger" ? colors.danger : due.tone === "warning" ? colors.warning : colors.textTertiary;
              return (
                <Pressable
                  key={debt.id}
                  onPress={() => router.push({ pathname: "/debt/[id]", params: { id: debt.id } })}
                  style={[styles.transaction, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={[styles.avatar, { backgroundColor: soft }]}>
                    <Text style={[styles.avatarText, { color: accent }]}>{debt.person.trim().charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <View style={styles.nameLine}>
                      <Text style={[styles.person, { color: colors.text }]} numberOfLines={1}>{debt.person}</Text>
                      <Text style={[styles.category, { color: colors.textTertiary }]}>{debt.category}</Text>
                    </View>
                    <View style={styles.detailLine}>
                      <Text style={[styles.direction, { color: accent }]}>{incomingDebt ? "You lent" : "You owe"}</Text>
                      <Text style={[styles.role, { color: colors.textSecondary }]}>{incomingDebt ? "Receivable" : "Payable"}</Text>
                      <Text style={[styles.due, { color: dueColor }]}>{due.label}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(remainingAmount(debt), debt.currency)}</Text>
                    <View style={[styles.directionButton, { backgroundColor: soft }]}>
                      <Ionicons name={incomingDebt ? "arrow-down" : "arrow-up"} size={13} color={accent} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name="book-outline" size={25} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Add your first debt and your personal ledger starts here.</Text>
          </View>
        )}

        <Pressable onPress={() => router.push("/add-debt")} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.addText}>Add debt</Text>
        </Pressable>

        <View style={[styles.tip, { backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="shield-checkmark-outline" size={19} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>Private by design. OwedBy is your simple personal money notebook.</Text>
        </View>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 28, paddingBottom: 122 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  identity: { flexDirection: "row", alignItems: "center", gap: 11 },
  greeting: { fontFamily: Fonts.bold, fontSize: 17 },
  brand: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 3 },
  settings: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  titleRow: { marginTop: 19 },
  title: { fontFamily: Fonts.extraBold, fontSize: 30 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  dateButton: { minHeight: 60, borderRadius: 17, borderWidth: 1, marginTop: 14, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  dateIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dateLabel: { fontFamily: Fonts.bold, fontSize: 8, letterSpacing: 1 },
  dateValue: { fontFamily: Fonts.semiBold, fontSize: 13, marginTop: 2 },
  summaryGrid: { flexDirection: "row", gap: 10, marginTop: 12 },
  summaryCard: { flex: 1, minHeight: 157, borderRadius: 19, borderWidth: 1, padding: 14 },
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryIcon: { width: 35, height: 35, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  countPill: { maxWidth: "62%", paddingHorizontal: 7, paddingVertical: 5, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 2 },
  countText: { fontFamily: Fonts.bold, fontSize: 8 },
  summaryLabel: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 13 },
  summaryAmount: { fontFamily: Fonts.extraBold, fontSize: 21, marginTop: 4 },
  summaryCaption: { fontFamily: Fonts.medium, fontSize: 9, marginTop: 4 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 19 },
  sectionSub: { fontFamily: Fonts.regular, fontSize: 10, marginTop: 3 },
  sectionCount: { fontFamily: Fonts.bold, fontSize: 11 },
  history: { borderRadius: 19, borderWidth: 1, overflow: "hidden" },
  transaction: { minHeight: 84, padding: 12, flexDirection: "row", alignItems: "center" },
  avatar: { width: 43, height: 43, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.extraBold, fontSize: 16 },
  transactionInfo: { flex: 1, marginLeft: 11, marginRight: 7 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  person: { fontFamily: Fonts.semiBold, fontSize: 13, flexShrink: 1 },
  category: { fontFamily: Fonts.medium, fontSize: 9, textTransform: "capitalize" },
  detailLine: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 6, flexWrap: "wrap" },
  direction: { fontFamily: Fonts.bold, fontSize: 9 },
  role: { fontFamily: Fonts.medium, fontSize: 9 },
  due: { fontFamily: Fonts.medium, fontSize: 9 },
  transactionRight: { alignItems: "flex-end", gap: 7 },
  amount: { fontFamily: Fonts.bold, fontSize: 13 },
  directionButton: { width: 25, height: 25, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  addButton: { height: 56, borderRadius: 18, marginTop: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  addText: { color: "#fff", fontFamily: Fonts.bold, fontSize: 15 },
  tip: { marginTop: 11, borderRadius: 16, padding: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  tipText: { flex: 1, fontFamily: Fonts.regular, fontSize: 10, lineHeight: 16 },
  empty: { borderRadius: 18, borderWidth: 1, padding: 28, alignItems: "center" },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 16 },
  emptyText: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18, textAlign: "center", maxWidth: 280, marginTop: 4 },
});

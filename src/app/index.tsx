import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";

import { BottomNav } from "@/components/bottom-nav";
import { OwedByLogo } from "@/components/owedby-logo";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { DebtType, remainingAmount } from "@/types/debt";
import { formatMoney } from "@/lib/currency";
import { useSettings } from "@/context/settings-context";

function dueLabel(value?: string) {
  if (!value) return { label: "No due date", tone: "neutral" as const };
  const date = new Date(value);
  const today = new Date();
  const diff = Math.ceil(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime()) /
      86400000,
  );
  if (diff <= 0) return { label: "Due today", tone: "danger" as const };
  if (diff <= 7)
    return {
      label:
        "Due " +
        date.toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
      tone: "warning" as const,
    };
  return {
    label:
      "Due " +
      date.toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
    tone: "neutral" as const,
  };
}

type Filter = "all" | DebtType | "due";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { debts, loading } = useDebts();
  const { defaultCurrency } = useSettings();
  const currencyDebts = debts.filter((debt) => debt.currency === defaultCurrency);
  const totalOwedToMe = currencyDebts.filter((d) => d.type === "they_owe_me").reduce((sum, d) => sum + remainingAmount(d), 0);
  const totalIOwe = currencyDebts.filter((d) => d.type === "i_owe_them").reduce((sum, d) => sum + remainingAmount(d), 0);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      debts
        .filter((debt) => remainingAmount(debt) > 0)
        .filter(
          (debt) =>
            filter === "all" ||
            (filter === "due"
              ? dueLabel(debt.dueDate).tone !== "neutral"
              : debt.type === filter),
        )
        .filter(
          (debt) =>
            debt.person.toLowerCase().includes(query.trim().toLowerCase()) ||
            debt.note.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .sort(
          (a, b) =>
            (a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY) -
            (b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY),
        ),
    [debts, filter, query],
  );


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <OwedByLogo size={42} />
            <View>
              <Text style={[styles.brand, { color: colors.text }]}>OwedBy</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Your money, remembered.
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              accessibilityLabel="Open settings"
            >
              <Ionicons name="settings-outline" size={21} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/add-debt")}
              style={[styles.headerButton, { backgroundColor: colors.primarySoft }]}
              accessibilityLabel="Add debt"
            >
              <Ionicons name="add" size={22} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: colors.successSoft },
              ]}
            >
              <Ionicons name="arrow-down" size={18} color={colors.success} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              People owe you
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatMoney(totalOwedToMe, defaultCurrency)}
            </Text>
          </View>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: colors.terracottaSoft },
              ]}
            >
              <Ionicons name="arrow-up" size={18} color={colors.terracotta} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              You owe
            </Text>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatMoney(totalIOwe, defaultCurrency)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={19} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people or notes"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {(
            [
              ["all", "All"],
              ["they_owe_me", "They owe me"],
              ["i_owe_them", "I owe"],
              ["due", "Due soon"],
            ] as const
          ).map(([value, label]) => (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[
                styles.filter,
                {
                  backgroundColor:
                    filter === value ? colors.primary : colors.surface,
                  borderColor:
                    filter === value ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === value ? "#fff" : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent debts
          </Text>
          <Text style={[styles.count, { color: colors.textTertiary }]}>
            {filtered.length}
          </Text>
        </View>

        {loading ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Loading your money notebook...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Ionicons name="book-outline" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {debts.length ? "Nothing matches" : "Your notebook is empty"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {debts.length
                ? "Try another filter or search."
                : "Add your first debt and OwedBy will keep track of it for you."}
            </Text>
          </View>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface }]}>
            {filtered.map((debt, index) => {
              const status = dueLabel(debt.dueDate);
              const statusColor =
                status.tone === "danger"
                  ? colors.danger
                  : status.tone === "warning"
                    ? colors.warning
                    : colors.textSecondary;
              const statusBg =
                status.tone === "danger"
                  ? colors.dangerSoft
                  : status.tone === "warning"
                    ? colors.warningSoft
                    : colors.surfaceSecondary;
              return (
                <Pressable
                  key={debt.id}
                  onPress={() =>
                    router.push({
                      pathname: "/debt/[id]",
                      params: { id: debt.id },
                    })
                  }
                  style={[
                    styles.debtRow,
                    index > 0 && {
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      {
                        backgroundColor:
                          debt.type === "they_owe_me"
                            ? colors.successSoft
                            : colors.terracottaSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarText,
                        {
                          color:
                            debt.type === "they_owe_me"
                              ? colors.success
                              : colors.terracotta,
                        },
                      ]}
                    >
                      {debt.person.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={[styles.person, { color: colors.text }]}>
                      {debt.person}
                    </Text>
                    <View style={styles.metaRow}>
                      <View
                        style={[styles.badge, { backgroundColor: statusBg }]}
                      >
                        <Text
                          style={[styles.badgeText, { color: statusColor }]}
                        >
                          {status.label}
                        </Text>
                      </View>
                      {debt.category === "family" ? (
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: colors.primarySoft },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              { color: colors.primary },
                            ]}
                          >
                            Family ledger
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.debtAmountWrap}>
                    <Text style={[styles.debtAmount, { color: colors.text }]}>
                      {formatMoney(remainingAmount(debt), debt.currency)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={colors.textTertiary}
                    />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => router.push("/add-debt")}
          style={[styles.mainAdd, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.mainAddText}>Add debt</Text>
        </Pressable>
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brand: { fontFamily: Fonts.extraBold, fontSize: 24 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, borderRadius: Radius.large, padding: Spacing.three },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardLabel: { fontFamily: Fonts.medium, fontSize: 12 },
  amount: { fontFamily: Fonts.extraBold, fontSize: 24, marginTop: 3 },
  currencyHint: { fontFamily: Fonts.medium, fontSize: 10, marginTop: 4 },
  search: {
    height: 52,
    borderWidth: 1,
    borderRadius: Radius.medium,
    marginTop: Spacing.four,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    marginLeft: 9,
  },
  filters: { gap: 8, paddingVertical: 14 },
  filter: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: { fontFamily: Fonts.medium, fontSize: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 20 },
  count: { fontFamily: Fonts.medium, fontSize: 12 },
  list: { borderRadius: Radius.large, overflow: "hidden" },
  debtRow: {
    minHeight: 82,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: Fonts.bold, fontSize: 17 },
  debtInfo: { flex: 1, marginLeft: 12 },
  person: { fontFamily: Fonts.semiBold, fontSize: 15 },
  metaRow: { flexDirection: "row", gap: 5, marginTop: 7, flexWrap: "wrap" },
  badge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontFamily: Fonts.medium, fontSize: 10 },
  debtAmountWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  debtAmount: { fontFamily: Fonts.bold, fontSize: 14 },
  emptyCard: {
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: 17 },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280,
  },
  mainAdd: {
    height: 54,
    borderRadius: Radius.large,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 24,
  },
  mainAddText: { color: "#fff", fontFamily: Fonts.bold, fontSize: 16 },
});

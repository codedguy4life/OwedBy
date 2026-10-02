import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";

import { Colors, FontSize, Fonts, IconSize, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { remainingAmount } from "@/types/debt";

const formatMoney = (value: number) => "₦" + value.toLocaleString("en-NG");
const formatDue = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "today";
  if (date.toDateString() === tomorrow.toDateString()) return "tomorrow";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
};

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { debts, totalOwedToMe, totalIOwe, loading } = useDebts();

  const recent = debts
    .filter((debt) => remainingAmount(debt) > 0)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>OwedBy</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your money, remembered.</Text>
          </View>
          <View style={[styles.profile, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="wallet-outline" size={IconSize.medium} color={colors.primary} />
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.successSoft }]}>
              <Ionicons name="arrow-down-outline" size={IconSize.medium} color={colors.success} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>People owe you</Text>
            <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(totalOwedToMe)}</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.warningSoft }]}>
              <Ionicons name="arrow-up-outline" size={IconSize.medium} color={colors.warning} />
            </View>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>You owe</Text>
            <Text style={[styles.amount, { color: colors.text }]}>{formatMoney(totalIOwe)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent debts</Text>
            <Text style={[styles.count, { color: colors.textTertiary }]}>{recent.length}</Text>
          </View>

          {loading ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading your debts...</Text>
            </View>
          ) : recent.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
                <Ionicons name="receipt-outline" size={IconSize.large} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No debts yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add your first debt and OwedBy will keep track of it for you.
              </Text>
            </View>
          ) : (
            <View style={[styles.list, { backgroundColor: colors.surface }]}>
              {recent.map((debt, index) => (
                <Pressable
                  key={debt.id}
                  onPress={() => router.push({ pathname: "/debt/[id]", params: { id: debt.id } })}
                  style={[styles.debtRow, index > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <View style={[styles.avatar, { backgroundColor: debt.type === "they_owe_me" ? colors.successSoft : colors.warningSoft }]}>
                    <Text style={[styles.avatarText, { color: debt.type === "they_owe_me" ? colors.success : colors.warning }]}>
                      {debt.person.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.debtInfo}>
                    <Text style={[styles.person, { color: colors.text }]}>{debt.person}</Text>
                    <Text style={[styles.due, { color: colors.textSecondary }]}>Due {formatDue(debt.dueDate)}</Text>
                  </View>
                  <View style={styles.debtAmountWrap}>
                    <Text style={[styles.debtAmount, { color: colors.text }]}>{formatMoney(remainingAmount(debt))}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable onPress={() => router.push("/add-debt")} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Ionicons name="add" size={IconSize.medium} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add debt</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.five, paddingBottom: Spacing.four },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.four },
  greeting: { fontFamily: Fonts.bold, fontSize: FontSize.largeTitle },
  subtitle: { fontFamily: Fonts.regular, fontSize: FontSize.body, marginTop: Spacing.one },
  profile: { width: 44, height: 44, borderRadius: Radius.pill, alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: Spacing.two },
  summaryCard: { flex: 1, borderRadius: Radius.large, padding: Spacing.three },
  iconContainer: { width: 38, height: 38, borderRadius: Radius.medium, alignItems: "center", justifyContent: "center", marginBottom: Spacing.two },
  cardLabel: { fontFamily: Fonts.medium, fontSize: FontSize.small },
  amount: { fontFamily: Fonts.bold, fontSize: FontSize.amount, marginTop: Spacing.one },
  section: { marginTop: Spacing.five },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.two },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: FontSize.title },
  count: { fontFamily: Fonts.medium, fontSize: FontSize.small },
  list: { borderRadius: Radius.large, overflow: "hidden" },
  debtRow: { minHeight: 76, paddingHorizontal: Spacing.three, flexDirection: "row", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: Radius.pill, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: Fonts.bold, fontSize: FontSize.bodyLarge },
  debtInfo: { flex: 1, marginLeft: Spacing.three },
  person: { fontFamily: Fonts.semiBold, fontSize: FontSize.body },
  due: { fontFamily: Fonts.regular, fontSize: FontSize.small, marginTop: Spacing.one },
  debtAmountWrap: { flexDirection: "row", alignItems: "center", gap: Spacing.one },
  debtAmount: { fontFamily: Fonts.semiBold, fontSize: FontSize.body },
  emptyCard: { borderRadius: Radius.large, borderWidth: 1, padding: Spacing.five, alignItems: "center" },
  emptyIcon: { width: 56, height: 56, borderRadius: Radius.pill, alignItems: "center", justifyContent: "center", marginBottom: Spacing.three },
  emptyTitle: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
  emptyText: { fontFamily: Fonts.regular, fontSize: FontSize.body, lineHeight: 21, textAlign: "center", marginTop: Spacing.one, maxWidth: 280 },
  addButton: { height: 56, borderRadius: Radius.large, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.one, marginTop: Spacing.five },
  addButtonText: { color: "#FFFFFF", fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
});

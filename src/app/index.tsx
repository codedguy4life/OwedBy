import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import {
  Colors,
  FontSize,
  Fonts,
  IconSize,
  Radius,
  Spacing,
} from "@/constants/theme";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's your money overview.
          </Text>
        </View>

        <Pressable
          style={[
            styles.profileButton,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Ionicons
            name="person-outline"
            size={IconSize.medium}
            color={colors.text}
          />
        </Pressable>
      </View>

      {/* Money summary */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.successSoft },
              ]}
            >
              <Ionicons
                name="arrow-down-outline"
                size={IconSize.medium}
                color={colors.success}
              />
            </View>

            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              People owe you
            </Text>
          </View>

          <Text style={[styles.amount, { color: colors.text }]}>₦0</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.warningSoft },
              ]}
            >
              <Ionicons
                name="arrow-up-outline"
                size={IconSize.medium}
                color={colors.warning}
              />
            </View>

            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
              You owe
            </Text>
          </View>

          <Text style={[styles.amount, { color: colors.text }]}>₦0</Text>
        </View>
      </View>

      {/* Recent debts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent debts
          </Text>

          <Pressable>
            <Text style={[styles.seeAll, { color: colors.primary }]}>
              See all
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}
          >
            <Ionicons
              name="wallet-outline"
              size={IconSize.large}
              color={colors.primary}
            />
          </View>

          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No debts yet
          </Text>

          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add your first debt and OwedBy will keep track of it for you.
          </Text>
        </View>
      </View>

      {/* Add debt button */}
      <Pressable
        style={[styles.addButton, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={IconSize.medium} color="#FFFFFF" />

        <Text style={styles.addButtonText}>Add debt</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },

  greeting: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.largeTitle,
  },

  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.body,
    marginTop: Spacing.one,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },

  summaryCard: {
    flex: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
  },

  cardHeader: {
    gap: Spacing.two,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: Radius.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },

  cardLabel: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.small,
  },

  amount: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.amount,
    marginTop: Spacing.one,
  },

  section: {
    marginTop: Spacing.five,
    flex: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.two,
  },

  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.title,
  },

  seeAll: {
    fontFamily: Fonts.medium,
    fontSize: FontSize.body,
  },

  emptyCard: {
    borderRadius: Radius.large,
    borderWidth: 1,
    padding: Spacing.five,
    alignItems: "center",
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.three,
  },

  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.bodyLarge,
  },

  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.body,
    lineHeight: 21,
    textAlign: "center",
    marginTop: Spacing.one,
    maxWidth: 280,
  },

  addButton: {
    height: 54,
    borderRadius: Radius.large,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontFamily: Fonts.semiBold,
    fontSize: FontSize.bodyLarge,
  },
});

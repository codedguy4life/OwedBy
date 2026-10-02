import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";

import { Colors, FontSize, Fonts, IconSize, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { scheduleDebtReminder } from "@/lib/notifications";
import { remainingAmount } from "@/types/debt";

const formatMoney = (value: number) => "₦" + value.toLocaleString("en-NG");
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { getDebt, addPayment, deleteDebt } = useDebts();
  const [paymentText, setPaymentText] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const debt = getDebt(id);

  if (!debt) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.text }]}>Debt not found.</Text>
        <Pressable onPress={() => router.replace("/")} style={[styles.smallButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.smallButtonText}>Back home</Text>
        </Pressable>
      </View>
    );
  }

  const remaining = remainingAmount(debt);
  const paid = debt.amount - remaining;

  const recordPayment = async () => {
    const amount = Number(paymentText.replace(/,/g, ""));
    if (!amount || amount <= 0 || amount > remaining) return;
    await addPayment(debt.id, amount);
    setPaymentText("");
    setShowPayment(false);
  };

  const remind = async () => {
    const reminderId = await scheduleDebtReminder(debt.person, debt.dueDate);
    Alert.alert(
      reminderId ? "Reminder set" : "Reminder not set",
      reminderId
        ? "OwedBy will remind you about " + debt.person + "."
        : "Allow notifications in your phone settings to use reminders.",
    );
  };

  const remove = () => {
    Alert.alert("Delete debt?", "This removes the debt and its payment history from this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDebt(debt.id);
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={IconSize.medium} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Debt detail</Text>
          <Pressable onPress={remove} style={styles.back}>
            <Ionicons name="trash-outline" size={IconSize.medium} color={colors.danger} />
          </Pressable>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surface }]}>
          <Text style={[styles.person, { color: colors.text }]}>{debt.person}</Text>
          <Text style={[styles.remaining, { color: colors.text }]}>{formatMoney(remaining)}</Text>
          <Text style={[styles.remainingLabel, { color: colors.textSecondary }]}>remaining</Text>
          <View style={[styles.meta, { borderTopColor: colors.border }]}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {debt.type === "they_owe_me" ? "They owe you" : "You owe them"}
            </Text>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>Due {formatDate(debt.dueDate)}</Text>
          </View>
        </View>

        {debt.note ? (
          <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>Note</Text>
            <Text style={[styles.noteText, { color: colors.text }]}>{debt.note}</Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ledger</Text>
          <Text style={[styles.paidText, { color: colors.textSecondary }]}>{formatMoney(paid)} paid</Text>
        </View>

        <View style={[styles.ledger, { backgroundColor: colors.surface }]}>
          <View style={styles.ledgerRow}>
            <View>
              <Text style={[styles.ledgerTitle, { color: colors.text }]}>Original debt</Text>
              <Text style={[styles.ledgerDate, { color: colors.textSecondary }]}>{formatDate(debt.createdAt)}</Text>
            </View>
            <Text style={[styles.ledgerAmount, { color: colors.text }]}>{formatMoney(debt.amount)}</Text>
          </View>

          {debt.payments.map((payment) => (
            <View key={payment.id} style={[styles.ledgerRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
              <View>
                <Text style={[styles.ledgerTitle, { color: colors.text }]}>Payment</Text>
                <Text style={[styles.ledgerDate, { color: colors.textSecondary }]}>{formatDate(payment.date)}</Text>
              </View>
              <Text style={[styles.ledgerAmount, { color: colors.success }]}>-{formatMoney(payment.amount)}</Text>
            </View>
          ))}

          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Remaining</Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>{formatMoney(remaining)}</Text>
          </View>
        </View>

        <Pressable onPress={() => setShowPayment(true)} disabled={remaining <= 0} style={[styles.primaryAction, { backgroundColor: remaining > 0 ? colors.primary : colors.surfaceSecondary }]}>
          <Ionicons name="cash-outline" size={IconSize.medium} color={remaining > 0 ? "#FFFFFF" : colors.textTertiary} />
          <Text style={[styles.primaryActionText, { color: remaining > 0 ? "#FFFFFF" : colors.textTertiary }]}>
            {remaining > 0 ? "Mark payment" : "Paid in full"}
          </Text>
        </Pressable>

        <Pressable onPress={remind} style={[styles.secondaryAction, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Ionicons name="notifications-outline" size={IconSize.medium} color={colors.primary} />
          <Text style={[styles.secondaryActionText, { color: colors.text }]}>Remind Oba</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showPayment} transparent animationType="slide" onRequestClose={() => setShowPayment(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Record payment</Text>
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>Remaining: {formatMoney(remaining)}</Text>
            <View style={[styles.amountInput, { borderColor: colors.border }]}>
              <Text style={[styles.naira, { color: colors.textSecondary }]}>₦</Text>
              <TextInput
                autoFocus
                value={paymentText}
                onChangeText={(value) => setPaymentText(value.replace(/[^0-9,]/g, ""))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                style={[styles.paymentField, { color: colors.text }]}
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setShowPayment(false)} style={[styles.cancel, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable disabled={!Number(paymentText.replace(/,/g, ""))} onPress={recordPayment} style={[styles.confirm, { backgroundColor: colors.primary }]}>
                <Text style={styles.confirmText}>Save payment</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.seven },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.four },
  notFound: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge, marginBottom: Spacing.three },
  smallButton: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Radius.medium },
  smallButtonText: { color: "#FFFFFF", fontFamily: Fonts.semiBold },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.four },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
  hero: { borderRadius: Radius.large, padding: Spacing.four, alignItems: "center" },
  person: { fontFamily: Fonts.semiBold, fontSize: FontSize.title },
  remaining: { fontFamily: Fonts.bold, fontSize: 36, marginTop: Spacing.three },
  remainingLabel: { fontFamily: Fonts.regular, fontSize: FontSize.body },
  meta: { width: "100%", marginTop: Spacing.four, paddingTop: Spacing.three, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontFamily: Fonts.medium, fontSize: FontSize.small },
  noteCard: { borderWidth: 1, borderRadius: Radius.medium, padding: Spacing.three, marginTop: Spacing.three },
  noteLabel: { fontFamily: Fonts.medium, fontSize: FontSize.small },
  noteText: { fontFamily: Fonts.regular, fontSize: FontSize.body, marginTop: Spacing.one, lineHeight: 21 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.five, marginBottom: Spacing.two },
  sectionTitle: { fontFamily: Fonts.semiBold, fontSize: FontSize.title },
  paidText: { fontFamily: Fonts.regular, fontSize: FontSize.small },
  ledger: { borderRadius: Radius.large, overflow: "hidden" },
  ledgerRow: { minHeight: 68, paddingHorizontal: Spacing.three, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ledgerTitle: { fontFamily: Fonts.medium, fontSize: FontSize.body },
  ledgerDate: { fontFamily: Fonts.regular, fontSize: FontSize.small, marginTop: Spacing.one },
  ledgerAmount: { fontFamily: Fonts.semiBold, fontSize: FontSize.body },
  totalRow: { minHeight: 68, paddingHorizontal: Spacing.three, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1 },
  totalLabel: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
  totalAmount: { fontFamily: Fonts.bold, fontSize: FontSize.bodyLarge },
  primaryAction: { height: 54, borderRadius: Radius.large, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.two, marginTop: Spacing.four },
  primaryActionText: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
  secondaryAction: { height: 54, borderRadius: Radius.large, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.two, marginTop: Spacing.two },
  secondaryActionText: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modal: { borderTopLeftRadius: Radius.large, borderTopRightRadius: Radius.large, padding: Spacing.four, paddingBottom: Spacing.seven },
  modalTitle: { fontFamily: Fonts.bold, fontSize: FontSize.title },
  modalHint: { fontFamily: Fonts.regular, fontSize: FontSize.body, marginTop: Spacing.one, marginBottom: Spacing.three },
  amountInput: { minHeight: 60, borderWidth: 1, borderRadius: Radius.medium, flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.three },
  naira: { fontFamily: Fonts.medium, fontSize: FontSize.title },
  paymentField: { flex: 1, fontFamily: Fonts.bold, fontSize: FontSize.title, marginLeft: Spacing.two },
  modalActions: { flexDirection: "row", gap: Spacing.two, marginTop: Spacing.three },
  cancel: { flex: 1, height: 52, borderRadius: Radius.medium, alignItems: "center", justifyContent: "center" },
  cancelText: { fontFamily: Fonts.semiBold, fontSize: FontSize.body },
  confirm: { flex: 1, height: 52, borderRadius: Radius.medium, alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#FFFFFF", fontFamily: Fonts.semiBold, fontSize: FontSize.body },
});

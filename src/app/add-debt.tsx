import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";

import { Colors, FontSize, Fonts, IconSize, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { DebtType } from "@/types/debt";

const money = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits).toLocaleString("en-NG") : "";
};

export default function AddDebtScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const { addDebt } = useDebts();

  const [person, setPerson] = useState("");
  const [amountText, setAmountText] = useState("");
  const [type, setType] = useState<DebtType>("they_owe_me");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [note, setNote] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const amount = Number(amountText.replace(/,/g, ""));
  const valid = person.trim().length > 0 && amount > 0;

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    const debt = await addDebt({
      person: person.trim(),
      amount,
      type,
      dueDate: dueDate.toISOString(),
      note: note.trim(),
    });
    setSaving(false);
    router.replace("/debt/" + debt.id);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Ionicons name="arrow-back" size={IconSize.medium} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Add debt</Text>
          <View style={styles.back} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Who?</Text>
        <TextInput value={person} onChangeText={setPerson} placeholder="e.g. Emeka" placeholderTextColor={colors.textTertiary} style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} autoCapitalize="words" />

        <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
        <View style={[styles.amountInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.naira, { color: colors.textSecondary }]}>₦</Text>
          <TextInput value={amountText} onChangeText={(value) => setAmountText(money(value))} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType="numeric" style={[styles.amountField, { color: colors.text }]} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Type</Text>
        <View style={[styles.toggle, { backgroundColor: colors.surfaceSecondary }]}>
          <Pressable onPress={() => setType("they_owe_me")} style={[styles.toggleOption, type === "they_owe_me" && { backgroundColor: colors.surface }]}>
            <Text style={[styles.toggleText, { color: type === "they_owe_me" ? colors.text : colors.textSecondary }]}>They owe me</Text>
          </Pressable>
          <Pressable onPress={() => setType("i_owe_them")} style={[styles.toggleOption, type === "i_owe_them" && { backgroundColor: colors.surface }]}>
            <Text style={[styles.toggleText, { color: type === "i_owe_them" ? colors.text : colors.textSecondary }]}>I owe them</Text>
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Due date</Text>
        <Pressable onPress={() => setShowPicker(true)} style={[styles.input, styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.dateText, { color: colors.text }]}>{dueDate.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</Text>
          <Ionicons name="calendar-outline" size={IconSize.medium} color={colors.textSecondary} />
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            minimumDate={new Date()}
            onValueChange={(_, selected) => {
              setShowPicker(false);
              setDueDate(selected);
            }}
            onDismiss={() => setShowPicker(false)}
            presentation="dialog"
          />
        )}

        <Text style={[styles.label, { color: colors.text }]}>Note <Text style={{ color: colors.textTertiary }}>(optional)</Text></Text>
        <TextInput value={note} onChangeText={setNote} placeholder="What was it for?" placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" style={[styles.noteInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]} />

        <Pressable disabled={!valid || saving} onPress={submit} style={[styles.submit, { backgroundColor: valid ? colors.primary : colors.surfaceSecondary }]}>
          <Text style={[styles.submitText, { color: valid ? "#FFFFFF" : colors.textTertiary }]}>{saving ? "Adding..." : "Add debt"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.four, paddingBottom: Spacing.seven },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.five },
  back: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: Fonts.bold, fontSize: FontSize.title },
  label: { fontFamily: Fonts.semiBold, fontSize: FontSize.body, marginBottom: Spacing.two, marginTop: Spacing.three },
  input: { minHeight: 54, borderWidth: 1, borderRadius: Radius.medium, paddingHorizontal: Spacing.three, fontFamily: Fonts.regular, fontSize: FontSize.bodyLarge },
  amountInput: { minHeight: 64, borderWidth: 1, borderRadius: Radius.medium, flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.three },
  naira: { fontFamily: Fonts.medium, fontSize: FontSize.title },
  amountField: { flex: 1, fontFamily: Fonts.bold, fontSize: FontSize.title, marginLeft: Spacing.two },
  toggle: { flexDirection: "row", padding: Spacing.one, borderRadius: Radius.medium },
  toggleOption: { flex: 1, minHeight: 48, alignItems: "center", justifyContent: "center", borderRadius: Radius.small },
  toggleText: { fontFamily: Fonts.medium, fontSize: FontSize.body },
  dateButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontFamily: Fonts.regular, fontSize: FontSize.bodyLarge },
  noteInput: { minHeight: 110, borderWidth: 1, borderRadius: Radius.medium, padding: Spacing.three, fontFamily: Fonts.regular, fontSize: FontSize.body, lineHeight: 21 },
  submit: { height: 56, borderRadius: Radius.large, alignItems: "center", justifyContent: "center", marginTop: Spacing.five },
  submitText: { fontFamily: Fonts.semiBold, fontSize: FontSize.bodyLarge },
});

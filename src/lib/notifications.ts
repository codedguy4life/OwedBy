import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function scheduleDebtReminder(person: string, dueDate: string) {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return undefined;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("debt-reminders", {
        name: "Debt reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const date = new Date(dueDate);
    date.setHours(9, 0, 0, 0);
    if (date.getTime() <= Date.now()) date.setTime(Date.now() + 60 * 1000);

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "OwedBy reminder",
        body: "Remember " + person + "'s debt today.",
        data: { person },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  } catch {
    return undefined;
  }
}

export async function cancelDebtReminder(reminderId?: string) {
  if (!reminderId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
  } catch {}
}

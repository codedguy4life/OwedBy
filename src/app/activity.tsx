import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";

export default function ActivityScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { debts } = useDebts();
  const items = useMemo(
    () => debts.flatMap((debt) => debt.payments.map((payment) => ({ ...payment, debtId: debt.id, person: debt.person, type: debt.type, currency: debt.currency }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [debts],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: colors.primary }]}>MONEY MOVEMENT</Text>
            <Text style={[styles.title, { color: colors.text }]}>Activity</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>Every payment, in one calm timeline.</Text>
          </View>
          <View style={[styles.iconBubble, { backgroundColor: colors.primarySoft }]}><Ionicons name="pulse-outline" size={22} color={colors.primary} /></View>
        </View>

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.successSoft }]}><Ionicons name="checkmark-circle-outline" size={22} color={colors.success} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.summaryValue, { color: colors.text }]}>{items.length}</Text><Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>payments recorded</Text></View>
          <View style={[styles.latest, { backgroundColor: colors.surfaceSecondary }]}><Text style={[styles.latestText, { color: colors.textSecondary }]}>LATEST</Text></View>
        </View>

        {items.length ? (
          <View style={styles.timeline}>
            {items.map((item, index) => {
              const incoming = item.type === "they_owe_me";
              const accent = incoming ? colors.success : colors.terracotta;
              const soft = incoming ? colors.successSoft : colors.terracottaSoft;
              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.dot, { backgroundColor: accent, borderColor: colors.background }]} />
                    {index < items.length - 1 ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}
                  </View>
                  <Pressable
                    onPress={() => router.push({ pathname: "/debt/[id]", params: { id: item.debtId } })}
                    style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.88 : 1 }]}
                  >
                    <View style={[styles.paymentIcon, { backgroundColor: soft }]}><Ionicons name={incoming ? "arrow-down" : "arrow-up"} size={18} color={accent} /></View>
                    <View style={styles.cardMain}>
                      <Text style={[styles.name, { color: colors.text }]}>{incoming ? "Payment from " : "Payment to "}{item.person}</Text>
                      <Text style={[styles.date, { color: colors.textSecondary }]}>{new Date(item.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</Text>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={[styles.amount, { color: accent }]}>{incoming ? "+" : "-"}{formatMoney(item.amount, item.currency)}</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} />
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}><Ionicons name="time-outline" size={27} color={colors.textTertiary} /></View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No activity yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>When you record a payment, it will appear here with the exact amount and date.</Text>
          </View>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  content:{padding:20,paddingTop:30,paddingBottom:112},
  header:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18},
  kicker:{fontFamily:Fonts.bold,fontSize:9,letterSpacing:1.2},
  title:{fontFamily:Fonts.extraBold,fontSize:31,marginTop:3},
  sub:{fontFamily:Fonts.regular,fontSize:12,marginTop:4},
  iconBubble:{width:46,height:46,borderRadius:15,alignItems:"center",justifyContent:"center"},
  summary:{minHeight:72,borderRadius:18,borderWidth:1,padding:13,flexDirection:"row",alignItems:"center"},
  summaryIcon:{width:42,height:42,borderRadius:14,alignItems:"center",justifyContent:"center",marginRight:11},
  summaryValue:{fontFamily:Fonts.extraBold,fontSize:19},
  summaryLabel:{fontFamily:Fonts.regular,fontSize:10,marginTop:2},
  latest:{paddingHorizontal:8,paddingVertical:5,borderRadius:8},
  latestText:{fontFamily:Fonts.bold,fontSize:8,letterSpacing:.7},
  timeline:{marginTop:20},
  timelineItem:{flexDirection:"row",minHeight:92},
  timelineRail:{width:24,alignItems:"center"},
  dot:{width:10,height:10,borderRadius:5,borderWidth:2,marginTop:23,zIndex:2},
  line:{width:1,flex:1,marginTop:-1},
  card:{flex:1,minHeight:78,borderRadius:17,borderWidth:1,padding:12,flexDirection:"row",alignItems:"center",marginBottom:10},
  paymentIcon:{width:40,height:40,borderRadius:13,alignItems:"center",justifyContent:"center"},
  cardMain:{flex:1,marginLeft:10},
  name:{fontFamily:Fonts.semiBold,fontSize:12.5},
  date:{fontFamily:Fonts.regular,fontSize:10,marginTop:4},
  amountBox:{alignItems:"flex-end",gap:3},
  amount:{fontFamily:Fonts.bold,fontSize:12.5},
  empty:{marginTop:20,borderRadius:19,borderWidth:1,padding:32,alignItems:"center"},
  emptyIcon:{width:56,height:56,borderRadius:28,alignItems:"center",justifyContent:"center",marginBottom:11},
  emptyTitle:{fontFamily:Fonts.semiBold,fontSize:16},
  emptyText:{fontFamily:Fonts.regular,fontSize:12,lineHeight:18,textAlign:"center",maxWidth:290,marginTop:4},
});
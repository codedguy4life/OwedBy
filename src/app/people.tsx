import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";
import { remainingAmount } from "@/types/debt";

export default function PeopleScreen() {
  const colors = Colors[useColorScheme() === "dark" ? "dark" : "light"];
  const { debts } = useDebts();
  const [query, setQuery] = useState("");
  const people = useMemo(() => {
    const grouped = new Map<string, typeof debts>();
    debts.forEach((d) => {
      const key = d.person.trim().toLowerCase();
      grouped.set(key, [...(grouped.get(key) ?? []), d]);
    });
    return [...grouped.values()].map((items) => ({
      person: items[0].person, items, open: items.filter((d) => remainingAmount(d) > 0),
    })).filter((p) => p.person.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => a.person.localeCompare(b.person));
  }, [debts, query]);
  const active = people.filter((p) => p.open.length).length;
  return <View style={[styles.container,{backgroundColor:colors.background}]}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={{flex:1}}><Text style={[styles.kicker,{color:colors.primary}]}>YOUR MONEY CIRCLE</Text><Text style={[styles.title,{color:colors.text}]}>People</Text><Text style={[styles.sub,{color:colors.textSecondary}]}>Everyone connected to your ledger.</Text></View><View style={[styles.counter,{backgroundColor:colors.surface,borderColor:colors.border}]}><Text style={[styles.counterNumber,{color:colors.text}]}>{active}</Text><Text style={[styles.counterLabel,{color:colors.textTertiary}]}>active</Text></View></View>
      <View style={[styles.search,{backgroundColor:colors.surface,borderColor:colors.border}]}><Ionicons name="search-outline" size={19} color={colors.textTertiary}/><TextInput value={query} onChangeText={setQuery} placeholder="Search people" placeholderTextColor={colors.textTertiary} style={[styles.searchInput,{color:colors.text}]}/>{query?<Pressable onPress={()=>setQuery("")}><Ionicons name="close-circle" size={18} color={colors.textTertiary}/></Pressable>:null}</View>
      <View style={[styles.hero,{backgroundColor:colors.primary}]}><View style={styles.heroIcon}><Ionicons name="people-outline" size={22} color="#fff"/></View><View style={{flex:1}}><Text style={styles.heroKicker}>PERSONAL LEDGER</Text><Text style={styles.heroTitle}>Know who owes what.</Text><Text style={styles.heroText}>{active} active relationship{active===1?"":"s"} in your notebook.</Text></View><Ionicons name="sparkles-outline" size={20} color="rgba(255,255,255,.78)"/></View>
      <View style={styles.section}><View><Text style={[styles.sectionTitle,{color:colors.text}]}>Your people</Text><Text style={[styles.sectionSub,{color:colors.textSecondary}]}>Tap a person to open their ledger.</Text></View><Text style={[styles.sectionCount,{color:colors.textTertiary}]}>{people.length}</Text></View>
      {people.length ? people.map((p) => {
        const first=p.open[0]??p.items[0]; const incoming=first.type==="they_owe_me"; const accent=incoming?colors.success:colors.terracotta; const soft=incoming?colors.successSoft:colors.terracottaSoft;
        const currencies=[...new Set(p.open.map(d=>d.currency))]; const payments=p.items.reduce((s,d)=>s+d.payments.length,0);
        return <Pressable key={p.person.toLowerCase()} onPress={()=>router.push({pathname:"/debt/[id]",params:{id:first.id}})} style={({pressed})=>[styles.card,{backgroundColor:colors.surface,borderColor:colors.border,opacity:pressed?.86:1}]}>
          <View style={[styles.avatar,{backgroundColor:soft}]}><Text style={[styles.initial,{color:accent}]}>{p.person.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.info}><View style={styles.nameRow}><Text style={[styles.name,{color:colors.text}]} numberOfLines={1}>{p.person}</Text>{!p.open.length?<View style={[styles.settled,{backgroundColor:colors.successSoft}]}><Ionicons name="checkmark" size={10} color={colors.success}/><Text style={[styles.settledText,{color:colors.success}]}>Settled</Text></View>:null}</View><Text style={[styles.meta,{color:colors.textSecondary}]}>{p.items.length} debt{p.items.length===1?"":"s"} · {payments} payment{payments===1?"":"s"}</Text>{currencies.length?<View style={styles.amounts}>{currencies.map(c=>{const total=p.open.filter(d=>d.currency===c).reduce((s,d)=>s+remainingAmount(d),0);return <Text key={c} style={[styles.amount,{color:accent}]}>{formatMoney(total,c)}</Text>})}</View>:<Text style={[styles.settledHint,{color:colors.textTertiary}]}>All balances settled</Text>}</View>
          <Ionicons name="chevron-forward" size={17} color={colors.textTertiary}/>
        </Pressable>;
      }):<View style={[styles.empty,{backgroundColor:colors.surface,borderColor:colors.border}]}><View style={[styles.emptyIcon,{backgroundColor:colors.primarySoft}]}><Ionicons name="people-outline" size={26} color={colors.primary}/></View><Text style={[styles.emptyTitle,{color:colors.text}]}>{query?"No people found":"Your people ledger is empty"}</Text><Text style={[styles.emptyText,{color:colors.textSecondary}]}>{query?"Try another name.":"Add your first debt and the person will appear here."}</Text></View>}
    </ScrollView><BottomNav/>
  </View>;
}
const styles=StyleSheet.create({container:{flex:1},content:{padding:20,paddingTop:30,paddingBottom:112},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18},kicker:{fontFamily:Fonts.bold,fontSize:9,letterSpacing:1.2},title:{fontFamily:Fonts.extraBold,fontSize:31,marginTop:3},sub:{fontFamily:Fonts.regular,fontSize:12,marginTop:4},counter:{width:60,minHeight:60,borderRadius:18,borderWidth:1,alignItems:"center",justifyContent:"center"},counterNumber:{fontFamily:Fonts.extraBold,fontSize:20},counterLabel:{fontFamily:Fonts.medium,fontSize:8,marginTop:1},search:{height:50,borderRadius:15,borderWidth:1,paddingHorizontal:13,flexDirection:"row",alignItems:"center"},searchInput:{flex:1,marginLeft:9,fontFamily:Fonts.regular,fontSize:14},hero:{marginTop:12,borderRadius:22,padding:18,flexDirection:"row",alignItems:"center",gap:11},heroIcon:{width:46,height:46,borderRadius:15,backgroundColor:"rgba(255,255,255,.14)",alignItems:"center",justifyContent:"center"},heroKicker:{color:"rgba(255,255,255,.65)",fontFamily:Fonts.bold,fontSize:8,letterSpacing:1},heroTitle:{color:"#fff",fontFamily:Fonts.extraBold,fontSize:18,marginTop:3},heroText:{color:"rgba(255,255,255,.76)",fontFamily:Fonts.regular,fontSize:10,marginTop:3},section:{marginTop:22,marginBottom:10,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},sectionTitle:{fontFamily:Fonts.bold,fontSize:18},sectionSub:{fontFamily:Fonts.regular,fontSize:10,marginTop:3},sectionCount:{fontFamily:Fonts.bold,fontSize:11},card:{minHeight:82,borderRadius:18,borderWidth:1,padding:13,flexDirection:"row",alignItems:"center",marginBottom:9},avatar:{width:45,height:45,borderRadius:15,alignItems:"center",justifyContent:"center"},initial:{fontFamily:Fonts.extraBold,fontSize:17},info:{flex:1,marginLeft:12,marginRight:8},nameRow:{flexDirection:"row",alignItems:"center",gap:7},name:{fontFamily:Fonts.semiBold,fontSize:14,flexShrink:1},meta:{fontFamily:Fonts.regular,fontSize:10,marginTop:3},amounts:{flexDirection:"row",flexWrap:"wrap",gap:6,marginTop:6},amount:{fontFamily:Fonts.bold,fontSize:12},settled:{paddingHorizontal:6,paddingVertical:3,borderRadius:7,flexDirection:"row",alignItems:"center",gap:2},settledText:{fontFamily:Fonts.bold,fontSize:8},settledHint:{fontFamily:Fonts.regular,fontSize:10,marginTop:6},empty:{marginTop:10,borderRadius:19,borderWidth:1,padding:32,alignItems:"center"},emptyIcon:{width:56,height:56,borderRadius:28,alignItems:"center",justifyContent:"center",marginBottom:11},emptyTitle:{fontFamily:Fonts.semiBold,fontSize:16},emptyText:{fontFamily:Fonts.regular,fontSize:12,lineHeight:18,textAlign:"center",maxWidth:280,marginTop:4}});

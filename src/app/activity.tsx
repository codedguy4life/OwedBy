import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { Colors, Fonts } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { formatMoney } from "@/lib/currency";

export default function ActivityScreen(){
  const colors=Colors[useColorScheme()==="dark"?"dark":"light"];
  const {debts}=useDebts();
  const items=debts
    .flatMap(d=>d.payments.map(p=>({...p,person:d.person,type:d.type,currency:d.currency})))
    .sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime());

  return <View style={[styles.container,{backgroundColor:colors.background}]}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.title,{color:colors.text}]}>Activity</Text>
      <Text style={[styles.sub,{color:colors.textSecondary}]}>Your payment history, in one place.</Text>
      {items.map(i=><Pressable
        key={i.id}
        onPress={()=>{
          const d=debts.find(x=>x.person===i.person);
          if(d)router.push({pathname:"/debt/[id]",params:{id:d.id}});
        }}
        style={[styles.row,{backgroundColor:colors.surface,borderColor:colors.border}]}
      >
        <View style={[styles.icon,{backgroundColor:colors.successSoft}]}>
          <Ionicons name="checkmark" size={19} color={colors.success}/>
        </View>
        <View style={{flex:1}}>
          <Text style={[styles.name,{color:colors.text}]}>Payment from {i.person}</Text>
          <Text style={[styles.meta,{color:colors.textSecondary}]}>
            {new Date(i.date).toLocaleDateString("en-NG",{day:"numeric",month:"short",year:"numeric"})}
          </Text>
        </View>
        <Text style={[styles.amount,{color:colors.success}]}>+{formatMoney(i.amount,i.currency)}</Text>
      </Pressable>)}
      {!items.length?<View style={[styles.empty,{backgroundColor:colors.surface}]}>
        <Ionicons name="time-outline" size={30} color={colors.textTertiary}/>
        <Text style={[styles.emptyText,{color:colors.textSecondary}]}>Payments you record will appear here.</Text>
      </View>:null}
    </ScrollView>
    <BottomNav/>
  </View>
}
const styles=StyleSheet.create({
  container:{flex:1},
  content:{padding:24,paddingTop:48,paddingBottom:110},
  title:{fontFamily:Fonts.extraBold,fontSize:30},
  sub:{fontFamily:Fonts.regular,fontSize:13,marginTop:4,marginBottom:24},
  row:{minHeight:74,borderRadius:16,borderWidth:1,padding:12,flexDirection:"row",alignItems:"center",marginBottom:8},
  icon:{width:42,height:42,borderRadius:21,alignItems:"center",justifyContent:"center",marginRight:12},
  name:{fontFamily:Fonts.semiBold,fontSize:13},
  meta:{fontFamily:Fonts.regular,fontSize:11,marginTop:4},
  amount:{fontFamily:Fonts.bold,fontSize:13},
  empty:{padding:32,borderRadius:16,alignItems:"center",gap:10},
  emptyText:{fontFamily:Fonts.regular,textAlign:"center"}
});

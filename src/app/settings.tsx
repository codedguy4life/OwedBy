import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { CURRENCIES } from "@/lib/currency";
import { useSettings } from "@/context/settings-context";

export default function SettingsScreen() {
  const colors=Colors[useColorScheme()==="dark"?"dark":"light"];
  const {defaultCurrency,setDefaultCurrency}=useSettings();
  return <View style={[styles.container,{backgroundColor:colors.background}]}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.iconButton}><Ionicons name="arrow-back" size={22} color={colors.text}/></Pressable><Text style={[styles.title,{color:colors.text}]}>Settings</Text><View style={styles.iconButton}/></View>
      <View style={[styles.hero,{backgroundColor:colors.surface}]}><View style={[styles.heroIcon,{backgroundColor:colors.primarySoft}]}><Ionicons name="settings-outline" size={24} color={colors.primary}/></View><Text style={[styles.heroTitle,{color:colors.text}]}>Money preferences</Text><Text style={[styles.heroText,{color:colors.textSecondary}]}>Choose the default currency for new debts. Existing debts keep their own currency.</Text></View>
      <Text style={[styles.sectionTitle,{color:colors.text}]}>Default currency</Text>
      <View style={[styles.list,{backgroundColor:colors.surface}]}>{CURRENCIES.map(c=>{const selected=c.code===defaultCurrency;return <Pressable key={c.code} onPress={()=>setDefaultCurrency(c.code)} style={[styles.row,{borderBottomColor:colors.border}]}><View style={[styles.symbol,{backgroundColor:selected?colors.primarySoft:colors.surfaceSecondary}]}><Text style={[styles.symbolText,{color:selected?colors.primary:colors.textSecondary}]}>{c.symbol}</Text></View><View style={styles.rowText}><Text style={[styles.name,{color:colors.text}]}>{c.name}</Text><Text style={[styles.code,{color:colors.textSecondary}]}>{c.code}</Text></View><Ionicons name={selected?"checkmark-circle":"ellipse-outline"} size={23} color={selected?colors.primary:colors.textTertiary}/></Pressable>})}</View>
    </ScrollView>
  </View>;
}
const styles=StyleSheet.create({container:{flex:1},content:{padding:Spacing.four,paddingTop:48,paddingBottom:64},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:24},iconButton:{width:44,height:44,alignItems:"center",justifyContent:"center"},title:{fontFamily:Fonts.bold,fontSize:22},hero:{borderRadius:Radius.large,padding:22,alignItems:"center"},heroIcon:{width:52,height:52,borderRadius:26,alignItems:"center",justifyContent:"center"},heroTitle:{fontFamily:Fonts.bold,fontSize:18,marginTop:12},heroText:{fontFamily:Fonts.regular,fontSize:12,lineHeight:19,textAlign:"center",marginTop:6},sectionTitle:{fontFamily:Fonts.semiBold,fontSize:14,marginTop:24,marginBottom:10},list:{borderRadius:Radius.large,overflow:"hidden"},row:{minHeight:68,flexDirection:"row",alignItems:"center",paddingHorizontal:14,borderBottomWidth:StyleSheet.hairlineWidth},symbol:{width:42,height:42,borderRadius:12,alignItems:"center",justifyContent:"center",marginRight:12},symbolText:{fontFamily:Fonts.bold,fontSize:16},rowText:{flex:1},name:{fontFamily:Fonts.semiBold,fontSize:13},code:{fontFamily:Fonts.regular,fontSize:11,marginTop:3}});

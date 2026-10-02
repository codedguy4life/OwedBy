import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View, useColorScheme } from "react-native";

import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { scheduleDebtReminder } from "@/lib/notifications";
import { remainingAmount } from "@/types/debt";

type Tone="friendly"|"formal"|"urgent";

export default function ReminderScreen(){
  const {id}=useLocalSearchParams<{id:string}>();
  const colors=Colors[useColorScheme()==="dark"?"dark":"light"];
  const {getDebt,setReminder}=useDebts();
  const [tone,setTone]=useState<Tone>("friendly");
  const [autoRemind,setAutoRemind]=useState(false);
  const debt=getDebt(id);

  const message=useMemo(()=>{
    if(!debt)return "";
    const amount="₦"+remainingAmount(debt).toLocaleString("en-NG");
    if(tone==="formal")return "Hello "+debt.person+", just a gentle reminder about the "+amount+" balance we have recorded. Please let me know when you expect to settle it. Thank you.";
    if(tone==="urgent")return "Hi "+debt.person+", this is a reminder about the outstanding "+amount+" balance. Please let me know when you can make the payment.";
    return "Hey "+debt.person+" 👋 Just a quick reminder about the "+amount+" you still have with me. No pressure — let me know when you can sort it out. Thanks!";
  },[debt,tone]);

  if(!debt)return <View style={[styles.center,{backgroundColor:colors.background}]}><Text style={[styles.notFound,{color:colors.text}]}>Debt not found.</Text></View>;

  const copy=async()=>{await Clipboard.setStringAsync(message);Alert.alert("Copied","Your reminder message is on the clipboard.")};
  const share=async()=>{await Share.share({message})};
  const whatsapp=()=>Linking.openURL("whatsapp://send?text="+encodeURIComponent(message)).catch(()=>share());
  const sms=()=>Linking.openURL("sms:?body="+encodeURIComponent(message)).catch(()=>Alert.alert("SMS unavailable","Your phone could not open the SMS composer."));
  const schedule=async(enabled:boolean)=>{setAutoRemind(enabled);if(enabled){const reminderId=await scheduleDebtReminder(debt.person,debt.dueDate,{title:"OwedBy reminder",body:message});if(reminderId)await setReminder(debt.id,reminderId);else setAutoRemind(false)}else{await setReminder(debt.id,undefined)}};

  return <ScrollView style={{backgroundColor:colors.background}} contentContainerStyle={styles.content}>
    <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.text}/></Pressable><Text style={[styles.title,{color:colors.text}]}>Smart reminder</Text><View style={styles.back}/></View>
    <View style={[styles.hero,{backgroundColor:colors.surface}]}><View style={[styles.icon,{backgroundColor:colors.primarySoft}]}><Ionicons name="chatbubble-ellipses" size={26} color={colors.primary}/></View><Text style={[styles.heroTitle,{color:colors.text}]}>Remind {debt.person}</Text><Text style={[styles.heroText,{color:colors.textSecondary}]}>Make the money conversation easier with a message that sounds like you.</Text></View>
    <Text style={[styles.label,{color:colors.text}]}>Tone</Text>
    <View style={styles.tones}>{([["friendly","Friendly"],["formal","Polite & Formal"],["urgent","Urgent"]] as const).map(([v,label])=><Pressable key={v} onPress={()=>setTone(v)} style={[styles.tone,{backgroundColor:tone===v?colors.primary:colors.surface,borderColor:tone===v?colors.primary:colors.border}]}><Text style={[styles.toneText,{color:tone===v?"#fff":colors.textSecondary}]}>{label}</Text></Pressable>)}</View>
    <Text style={[styles.label,{color:colors.text}]}>Message preview</Text>
    <View style={[styles.preview,{backgroundColor:colors.surface,borderColor:colors.border}]}><Text style={[styles.previewText,{color:colors.text}]}>{message}</Text></View>
    <View style={styles.actions}><Pressable onPress={whatsapp} style={[styles.whatsapp,{backgroundColor:colors.success}]}><Ionicons name="logo-whatsapp" size={20} color="#fff"/><Text style={styles.whiteText}>Share to WhatsApp</Text></Pressable><Pressable onPress={sms} style={[styles.action,{backgroundColor:colors.surface,borderColor:colors.border}]}><Ionicons name="chatbox-outline" size={20} color={colors.primary}/><Text style={[styles.actionText,{color:colors.text}]}>Send via SMS</Text></Pressable><Pressable onPress={copy} style={[styles.action,{backgroundColor:colors.surface,borderColor:colors.border}]}><Ionicons name="copy-outline" size={20} color={colors.primary}/><Text style={[styles.actionText,{color:colors.text}]}>Copy message</Text></Pressable></View>
    <View style={[styles.schedule,{backgroundColor:colors.surface}]}><View style={{flex:1}}><Text style={[styles.scheduleTitle,{color:colors.text}]}>Auto-remind me</Text><Text style={[styles.scheduleText,{color:colors.textSecondary}]}>Schedule a private reminder for the due date.</Text></View><Switch value={autoRemind} onValueChange={schedule} trackColor={{false:colors.surfaceSecondary,true:colors.primarySoft}} thumbColor={autoRemind?colors.primary:colors.textTertiary}/></View>
  </ScrollView>
}

const styles=StyleSheet.create({content:{padding:24,paddingBottom:64},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:24},back:{width:44,height:44,alignItems:"center",justifyContent:"center"},title:{fontFamily:Fonts.bold,fontSize:22},hero:{borderRadius:18,padding:24,alignItems:"center"},icon:{width:56,height:56,borderRadius:28,alignItems:"center",justifyContent:"center"},heroTitle:{fontFamily:Fonts.bold,fontSize:20,marginTop:12},heroText:{fontFamily:Fonts.regular,fontSize:13,lineHeight:20,textAlign:"center",marginTop:6},label:{fontFamily:Fonts.semiBold,fontSize:14,marginTop:24,marginBottom:9},tones:{flexDirection:"row",gap:7},tone:{flex:1,minHeight:42,borderRadius:14,borderWidth:1,alignItems:"center",justifyContent:"center",paddingHorizontal:7},toneText:{fontFamily:Fonts.medium,fontSize:11,textAlign:"center"},preview:{borderRadius:18,borderWidth:1,padding:18,minHeight:135},previewText:{fontFamily:Fonts.regular,fontSize:14,lineHeight:22},actions:{gap:9,marginTop:16},whatsapp:{height:52,borderRadius:16,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},whiteText:{color:"#fff",fontFamily:Fonts.semiBold,fontSize:14},action:{height:52,borderRadius:16,borderWidth:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},actionText:{fontFamily:Fonts.semiBold,fontSize:14},schedule:{marginTop:20,borderRadius:16,padding:16,flexDirection:"row",alignItems:"center"},scheduleTitle:{fontFamily:Fonts.semiBold,fontSize:14},scheduleText:{fontFamily:Fonts.regular,fontSize:11,lineHeight:17,marginTop:3},center:{flex:1,alignItems:"center",justifyContent:"center"},notFound:{fontFamily:Fonts.semiBold}});

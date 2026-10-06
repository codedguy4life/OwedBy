import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useColorScheme } from "react-native";
import { Colors, FontSize, Fonts, Radius, Spacing } from "@/constants/theme";
import { useDebts } from "@/context/debt-context";
import { useSettings } from "@/context/settings-context";
import { CURRENCIES, CurrencyCode, currencySymbol } from "@/lib/currency";
import { DebtCategory, DebtType } from "@/types/debt";

const money = (value: string, currency: CurrencyCode) => { const cleaned=value.replace(/,/g,"").replace(/[^0-9.]/g,""); const parts=cleaned.split("."); const decimals=currency==="JPY"?0:2; const integer=parts[0]||""; const fraction=parts[1]?.slice(0,decimals) ?? ""; if(!integer&&!fraction)return ""; const grouped=integer?Number(integer).toLocaleString("en-US"): "0"; return decimals&&parts.length>1 ? `${grouped}.${fraction}` : grouped; };
const categories: Array<[DebtCategory,string]> = [["general","General"],["family","Family"],["food","Food"],["transport","Transport"],["work","Work"],["rent","Rent"],["other","Other"]];

export default function AddDebtScreen() {
  const colors=Colors[useColorScheme()==="dark"?"dark":"light"];
  const {addDebt}=useDebts();
  const {defaultCurrency}=useSettings();
  const [person,setPerson]=useState("");
  const [amountText,setAmountText]=useState("");
  const [currency,setCurrency]=useState<CurrencyCode>(defaultCurrency);
  const [type,setType]=useState<DebtType>("they_owe_me");
  const [borrowedDate,setBorrowedDate]=useState<Date|null>(null);
  const [dueDate,setDueDate]=useState<Date|null>(()=>{const d=new Date();d.setDate(d.getDate()+7);return d;});
  const [category,setCategory]=useState<DebtCategory>("general");
  const [note,setNote]=useState("");
  const [showBorrowed,setShowBorrowed]=useState(false);
  const [showDue,setShowDue]=useState(false);
  const [saving,setSaving]=useState(false);
  useEffect(()=>setCurrency(defaultCurrency),[defaultCurrency]);
  const amount=Number(amountText.replace(/,/g,""));
  const valid=person.trim().length>0&&amount>0;
  const submit=async()=>{if(!valid)return;setSaving(true);const debt=await addDebt({person:person.trim(),amount,currency,type,borrowedDate:borrowedDate?.toISOString(),dueDate:dueDate?.toISOString(),note:note.trim(),category});setSaving(false);router.replace({pathname:"/debt/[id]",params:{id:debt.id}});};
  const quickAmounts = currency==="JPY" ? [1000,5000,10000] : ["USD","GBP","EUR","CAD","AUD"].includes(currency) ? [10,50,100] : currency==="INR" ? [100,500,1000] : [1000,5000,10000];
  const increment=(n:number)=>setAmountText(money(String(amount+n),currency));

  return <KeyboardAvoidingView style={{flex:1,backgroundColor:colors.background}} behavior={Platform.OS==="ios"?"padding":undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Pressable onPress={()=>router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.text}/></Pressable><Text style={[styles.title,{color:colors.text}]}>Add debt</Text><View style={styles.back}/></View>
      <Text style={[styles.label,{color:colors.text}]}>Who?</Text>
      <TextInput value={person} onChangeText={setPerson} placeholder="e.g. Emeka" placeholderTextColor={colors.textTertiary} autoCapitalize="words" style={[styles.input,{color:colors.text,backgroundColor:colors.surface,borderColor:colors.border}]}/>
      {person.trim()?<View style={[styles.contactChip,{backgroundColor:colors.primarySoft}]}><View style={[styles.avatar,{backgroundColor:colors.primary}]}><Text style={styles.avatarText}>{person.trim()[0].toUpperCase()}</Text></View><Text style={[styles.chipText,{color:colors.text}]}>{person.trim()}</Text><Ionicons name="checkmark-circle" size={18} color={colors.primary}/></View>:null}

      <Text style={[styles.label,{color:colors.text}]}>Amount</Text>
      <View style={[styles.amountInput,{backgroundColor:colors.surface,borderColor:colors.border}]}><Text style={[styles.currencySymbol,{color:colors.textSecondary}]}>{currencySymbol(currency)}</Text><TextInput value={amountText} onChangeText={v=>setAmountText(money(v,currency))} placeholder="0" placeholderTextColor={colors.textTertiary} keyboardType={currency==="NGN"||currency==="GHS"||currency==="KES"||currency==="ZAR"||currency==="JPY"||currency==="INR"?"numeric":"decimal-pad"} style={[styles.amountField,{color:colors.text}]}/></View>
      <View style={styles.quickRow}>{quickAmounts.map(n=><Pressable key={n} onPress={()=>increment(n)} style={[styles.quick,{backgroundColor:colors.surfaceSecondary}]}><Text style={[styles.quickText,{color:colors.textSecondary}]}>+{currencySymbol(currency)}{n.toLocaleString()}</Text></Pressable>)}</View>

      <Text style={[styles.label,{color:colors.text}]}>Currency</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyRow}>{CURRENCIES.map(c=><Pressable key={c.code} onPress={()=>setCurrency(c.code)} style={[styles.currencyChip,{backgroundColor:currency===c.code?colors.primary:colors.surface,borderColor:currency===c.code?colors.primary:colors.border}]}><Text style={[styles.currencyCode,{color:currency===c.code?"#fff":colors.text}]}>{c.code}</Text><Text style={[styles.currencyName,{color:currency===c.code?"#fff":colors.textSecondary}]}>{c.symbol}</Text></Pressable>)}</ScrollView>

      <Text style={[styles.label,{color:colors.text}]}>Direction</Text>
      <View style={[styles.toggle,{backgroundColor:colors.surfaceSecondary}]}><Pressable onPress={()=>setType("they_owe_me")} style={[styles.toggleOption,type==="they_owe_me"&&{backgroundColor:colors.surface}]}><Ionicons name="arrow-down" size={17} color={type==="they_owe_me"?colors.success:colors.textSecondary}/><Text style={[styles.toggleText,{color:type==="they_owe_me"?colors.text:colors.textSecondary}]}>They owe me</Text></Pressable><Pressable onPress={()=>setType("i_owe_them")} style={[styles.toggleOption,type==="i_owe_them"&&{backgroundColor:colors.surface}]}><Ionicons name="arrow-up" size={17} color={type==="i_owe_them"?colors.terracotta:colors.textSecondary}/><Text style={[styles.toggleText,{color:type==="i_owe_them"?colors.text:colors.textSecondary}]}>I owe them</Text></Pressable></View>

      <Text style={[styles.label,{color:colors.text}]}>Borrowed date <Text style={{color:colors.textTertiary}}>(optional)</Text></Text>
      <Pressable onPress={()=>setShowBorrowed(true)} style={[styles.input,styles.dateButton,{backgroundColor:colors.surface,borderColor:colors.border}]}><Text style={[styles.dateText,{color:borrowedDate?colors.text:colors.textTertiary}]}>{borrowedDate?borrowedDate.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}):"Select date"}</Text><Ionicons name="calendar-outline" size={21} color={colors.textSecondary}/></Pressable>
      {showBorrowed?<DateTimePicker value={borrowedDate??new Date()} mode="date" maximumDate={new Date()} onValueChange={(event)=>{setShowBorrowed(false);const selected=event.value;if(selected)setBorrowedDate(selected)}} onDismiss={()=>setShowBorrowed(false)} presentation="dialog"/>:null}

      <Text style={[styles.label,{color:colors.text}]}>Due date <Text style={{color:colors.textTertiary}}>(optional)</Text></Text>
      <Pressable onPress={()=>setShowDue(true)} style={[styles.input,styles.dateButton,{backgroundColor:colors.surface,borderColor:colors.border}]}><Text style={[styles.dateText,{color:dueDate?colors.text:colors.textTertiary}]}>{dueDate?dueDate.toLocaleDateString(undefined,{day:"numeric",month:"long",year:"numeric"}):"No due date"}</Text><Ionicons name="calendar-outline" size={21} color={colors.textSecondary}/></Pressable>
      {showDue?<DateTimePicker value={dueDate??new Date()} mode="date" minimumDate={new Date()} onValueChange={(event)=>{setShowDue(false);const selected=event.value;if(selected)setDueDate(selected)}} onDismiss={()=>setShowDue(false)} presentation="dialog"/>:null}

      <Text style={[styles.label,{color:colors.text}]}>Category <Text style={{color:colors.textTertiary}}>(optional)</Text></Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>{categories.map(([value,label])=><Pressable key={value} onPress={()=>setCategory(value)} style={[styles.category,{backgroundColor:category===value?colors.primary:colors.surface,borderColor:category===value?colors.primary:colors.border}]}><Text style={[styles.categoryText,{color:category===value?"#fff":colors.textSecondary}]}>{label}</Text></Pressable>)}</ScrollView>

      <Text style={[styles.label,{color:colors.text}]}>Note <Text style={{color:colors.textTertiary}}>(optional)</Text></Text>
      <TextInput value={note} onChangeText={setNote} placeholder="What was it for?" placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" style={[styles.noteInput,{color:colors.text,backgroundColor:colors.surface,borderColor:colors.border}]}/>

      <View style={[styles.privacy,{backgroundColor:colors.surfaceSecondary}]}><Ionicons name="lock-closed-outline" size={18} color={colors.primary}/><View style={{flex:1}}><Text style={[styles.privacyTitle,{color:colors.text}]}>Private by design</Text><Text style={[styles.privacyText,{color:colors.textSecondary}]}>Your debt stays on this device. No bank login, card number or BVN is needed.</Text></View></View>
      <Pressable disabled={!valid||saving} onPress={submit} style={[styles.submit,{backgroundColor:valid?colors.primary:colors.surfaceSecondary}]}><Text style={[styles.submitText,{color:valid?"#fff":colors.textTertiary}]}>{saving?"Adding...":"Add debt"}</Text></Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles=StyleSheet.create({content:{padding:Spacing.four,paddingBottom:Spacing.seven},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:Spacing.four},back:{width:44,height:44,alignItems:"center",justifyContent:"center"},title:{fontFamily:Fonts.bold,fontSize:FontSize.title},label:{fontFamily:Fonts.semiBold,fontSize:14,marginBottom:8,marginTop:16},input:{minHeight:54,borderWidth:1,borderRadius:Radius.medium,paddingHorizontal:16,fontFamily:Fonts.regular,fontSize:16},contactChip:{height:46,borderRadius:23,flexDirection:"row",alignItems:"center",paddingHorizontal:8,marginTop:8,gap:9},avatar:{width:32,height:32,borderRadius:16,alignItems:"center",justifyContent:"center"},avatarText:{color:"#fff",fontFamily:Fonts.bold},chipText:{flex:1,fontFamily:Fonts.semiBold,fontSize:13},amountInput:{minHeight:70,borderWidth:1,borderRadius:Radius.medium,flexDirection:"row",alignItems:"center",paddingHorizontal:16},currencySymbol:{fontFamily:Fonts.medium,fontSize:24},amountField:{flex:1,fontFamily:Fonts.extraBold,fontSize:30,marginLeft:8},quickRow:{flexDirection:"row",gap:8,marginTop:8},quick:{paddingHorizontal:12,paddingVertical:8,borderRadius:16},quickText:{fontFamily:Fonts.medium,fontSize:11},currencyRow:{gap:8,paddingBottom:2},currencyChip:{minWidth:72,height:48,borderRadius:14,borderWidth:1,paddingHorizontal:10,alignItems:"center",justifyContent:"center"},currencyCode:{fontFamily:Fonts.bold,fontSize:11},currencyName:{fontFamily:Fonts.medium,fontSize:11,marginTop:2},toggle:{flexDirection:"row",padding:4,borderRadius:Radius.medium},toggleOption:{flex:1,minHeight:48,alignItems:"center",justifyContent:"center",borderRadius:10,flexDirection:"row",gap:7},toggleText:{fontFamily:Fonts.medium,fontSize:13},dateButton:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},dateText:{fontFamily:Fonts.regular,fontSize:15},categories:{gap:8},category:{height:36,paddingHorizontal:13,borderRadius:18,borderWidth:1,alignItems:"center",justifyContent:"center"},categoryText:{fontFamily:Fonts.medium,fontSize:11},noteInput:{minHeight:100,borderWidth:1,borderRadius:Radius.medium,padding:16,fontFamily:Fonts.regular,fontSize:14,lineHeight:21},privacy:{marginTop:18,padding:13,borderRadius:Radius.medium,flexDirection:"row",gap:10},privacyTitle:{fontFamily:Fonts.semiBold,fontSize:12},privacyText:{fontFamily:Fonts.regular,fontSize:11,lineHeight:17,marginTop:2},submit:{height:56,borderRadius:Radius.large,alignItems:"center",justifyContent:"center",marginTop:20},submitText:{fontFamily:Fonts.bold,fontSize:16}});

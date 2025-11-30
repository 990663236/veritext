import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearToken } from "../lib/api";
import { router } from "expo-router";
import { colors } from "../constants/theme";

export default function Profile() {
  const [email,setEmail] = React.useState<string>("(sin correo)");
  React.useEffect(()=>{ (async()=> setEmail((await AsyncStorage.getItem("token")) ? "Usuario" : "(sin correo)"))(); },[]);

  return (
    <View style={s.container}>
      <Text style={s.h1}>PERFIL</Text>
      <View style={s.card}>
        <Row k="Nombre:" v="Manuel Calderon" />
        <Row k="Correo:" v={email} />
        <Row k="Institución:" v="UPN" />
      </View>

      <TouchableOpacity style={s.btnLight} onPress={()=>router.push("/profile-edit")}><Text style={s.btnTxtDark}>EDITAR</Text></TouchableOpacity>
      <TouchableOpacity style={s.btnDark} onPress={async()=>{ await clearToken(); router.replace("/login"); }}>
        <Text style={s.btnTxt}>CERRAR SESION</Text>
      </TouchableOpacity>
    </View>
  );
}

const Row = ({k,v}:{k:string;v:string}) => (
  <View style={{flexDirection:"row",marginVertical:6}}>
    <Text style={{width:120,color:colors.text,fontSize:16}}>{k}</Text>
    <Text style={{color:colors.text,fontSize:16,fontWeight:"700"}}>{v}</Text>
  </View>
);

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:"#fff",padding:24},
  h1:{fontSize:32,color:colors.teal,fontWeight:"900",marginBottom:16,textAlign:"center"},
  card:{backgroundColor:"#F1F2F8",padding:18,borderRadius:18,marginBottom:16},
  btnLight:{backgroundColor:colors.cream,padding:16,borderRadius:14,alignItems:"center",marginBottom:12},
  btnDark:{backgroundColor:colors.teal,padding:16,borderRadius:14,alignItems:"center"},
  btnTxt:{color:"#fff",fontWeight:"900"},
  btnTxtDark:{color:colors.teal,fontWeight:"900"},
});

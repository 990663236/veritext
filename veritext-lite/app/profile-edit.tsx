import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/theme";

export default function ProfileEdit() {
  const [name,setName] = useState("Manuel Calderon");
  const [email,setEmail] = useState("manuel@demo.com");
  const [inst,setInst] = useState("UPN");

  return (
    <View style={s.container}>
      <Text style={s.h1}>PERFIL</Text>
      <View style={s.card}>
        <Field label="Nombre:" value={name} onChange={setName}/>
        <Field label="Correo:" value={email} onChange={setEmail}/>
        <Field label="Institución:" value={inst} onChange={setInst}/>
      </View>
      <TouchableOpacity style={s.btn} onPress={()=>{ Alert.alert("Guardado","Datos actualizados (mock)"); router.back(); }}>
        <Text style={s.btnTxt}>GUARDAR</Text>
      </TouchableOpacity>
    </View>
  );
}

function Field({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) {
  return (
    <View style={{marginBottom:10}}>
      <Text style={{color:colors.text,marginBottom:4}}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} style={s.input}/>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:"#fff",padding:24},
  h1:{fontSize:32,color:colors.teal,fontWeight:"900",marginBottom:16,textAlign:"center"},
  card:{backgroundColor:"#F1F2F8",padding:18,borderRadius:18,marginBottom:16},
  input:{backgroundColor:"#fff",borderColor:"#e6e6e6",borderWidth:1,borderRadius:12,padding:12},
  btn:{backgroundColor:colors.cream,padding:16,borderRadius:14,alignItems:"center"},
  btnTxt:{color:colors.teal,fontWeight:"900"},
});

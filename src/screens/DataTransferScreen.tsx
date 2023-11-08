import { Button,  TextInput, StyleSheet, View, Alert, Text} from 'react-native'
import React, { useState } from 'react'
import RNFS from 'react-native-fs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import { writeFile } from 'react-native-fs'
import Aes from 'react-native-aes-crypto'
import * as ScopedStorage from 'react-native-scoped-storage'

type DataTransferProps = NativeStackScreenProps<RootStackParamList, 'DataTransferScreen'>
const DataTransferScreen = ({navigation, route}: DataTransferProps) => {
  const {ExistingPassword} = route.params
  const [password_string, set_password] = useState("");
  const internal_storage_file_data_path = RNFS.DocumentDirectoryPath+'/PasswordManagerData.json';
  const external_storage_file_data_path = '/PasswordManagerData.json';
  const decryption_and_read = async (key: string, message_string: string, count = 500)=> {
    let  Mainkey = "MasterPassword"
    if (key!=""){
     Mainkey = key
    }
    const initialization_vector = "21081993000000000000000039918012"
    const first_key = await Aes.pbkdf2(Mainkey, "AESsalt", count, 256)
    const decrypted_data = await Aes.decrypt(message_string, first_key, initialization_vector, 'aes-256-cbc')
    return decrypted_data
  }

  const encryption_and_write = async (key: string, message_string: string, storage_file_path: string, count = 500)=> {
    let  Mainkey = "MasterPassword"
    if (key!=""){
     Mainkey = key
    }
    const initialization_vector = "21081993000000000000000039918012"
    const first_key = await Aes.pbkdf2(Mainkey, "AESsalt", count, 256)
    const encrypted_data = await Aes.encrypt(message_string, first_key, initialization_vector, 'aes-256-cbc')
    await writeFile(storage_file_path, encrypted_data);
  }

  const readFile_internal = (path: string) => {
    RNFS.exists(path).then(async (is_existing)=>{
    if (is_existing){
      let response = await RNFS.readFile(path);
      response = await decryption_and_read(ExistingPassword, response);
      let dir = await ScopedStorage.createDocument("PasswordManagerData","application/json", response)
      if(dir!=null){
      Alert.alert('Data Export Successful','App data is successfully exported.');
      }
    }
    else{
      Alert.alert("App contains no data to export.");
    }
  }).catch((err)=>{
      Alert.alert("Error when exporting the data.");
  });}

  const readFile_unencrypted = async (path: string) => {
    let file = await ScopedStorage.openDocument(true);
    if (file!=null){
      await encryption_and_write(ExistingPassword, file.data, internal_storage_file_data_path);
      Alert.alert('Data Import Successful','App data is successfully imported.');      
    }
    else{
      Alert.alert("File not read.");
    }
  }
  
  return (
    <View style={styles.container}>
      <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{set_password(string_value)}}
      value={password_string}
      placeholder="Enter Password"
      ></TextInput>
      <View style={styles.ButtonPair}>
      <View style={styles.ButtonTemplate}>
      <Button
      title = 'IMPORT DATA FROM'
      onPress = {async ()=>{
        if(ExistingPassword == password_string){
          readFile_unencrypted(external_storage_file_data_path);
          navigation.pop();
          navigation.replace("LoginScreen"); 
        }
        else{
          Alert.alert('Passwords do not match !','Enter Password does not match with Existing Password.');
        }
  }}
      /></View>
      <View style={styles.ButtonTemplate}>
      <Button
      title = 'EXPORT DATA TO'
      onPress = {async ()=>{
          if(ExistingPassword == password_string){
            readFile_internal(internal_storage_file_data_path);
            navigation.pop();
            navigation.replace("LoginScreen"); 
          }
          else{
            Alert.alert('Passwords do not match !','Enter Password does not match with Existing Password.');
          }
    }}
      />

      </View>
      </View>
      </View>
  )
}

export default DataTransferScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "lightcyan"
    },
    PasswordInput:{
        backgroundColor: "white",
        borderColor: "grey",
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        margin: 10,
        color: "black"
    },
    ButtonPair:{
        flexDirection: 'row',
        marginTop: 10,
    },
    ButtonTemplate:{
        margin: 10,
    }
})
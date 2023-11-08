import { Button,  TextInput, StyleSheet, Text, View, Alert, PermissionsAndroid, Platform  } from 'react-native'
import React, { useState } from 'react'
import RNFS, { writeFile }  from 'react-native-fs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import Aes from 'react-native-aes-crypto'

type LoginProps = NativeStackScreenProps<RootStackParamList, 'CreateScreen'>

const CreateScreen = ({navigation}: LoginProps) => {
  let net_dict =   {data:[]}
  let goto_overall_screen = true
  let data_json = net_dict
  
  const encryption_and_write = async (key: string, message_string: string, storage_file_path: string, count = 500)=> {
    let  Mainkey = "MasterPassword"
    if (key!=""){
     Mainkey = key
    }
    const initialization_vector = "21081993000000000000000039918012"
    const first_key = await Aes.pbkdf2(Mainkey, "AESsalt", count, 256)
    const encrypted_data = await Aes.encrypt(message_string, first_key, initialization_vector, 'aes-256-cbc')
    writeFile(storage_file_path, encrypted_data);
  }

  const permission_reqused_fn = async() =>{
    try{
    const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
            title: "Storage Permisison: ",
            message:"This app requires storage permission in order to store data on device.",
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK'
        }
    );
    if (granted=== PermissionsAndroid.RESULTS.GRANTED || Number(Platform.Version) >=33){
        goto_overall_screen = true
    }
    else{
        goto_overall_screen = false
        Alert.alert("Storage Permission is not granted.");
    }}catch(err){
      goto_overall_screen = false
        Alert.alert("Storage Permission is not granted.");
    }
    }
  const [password_string, set_password] = useState('');
  const [password_string_attempt_1, set_password_attempt_1] = useState('');
  const storage_file_key_path = RNFS.DocumentDirectoryPath+'/PasswordManagerKey.json'
  const storage_file_data_path = RNFS.DocumentDirectoryPath+'/PasswordManagerData.json'
  return (
    <View style={styles.container}>
      
     <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{set_password(string_value)}}
      value={password_string}
      placeholder="Create Password"
      ></TextInput>
      <Text> </Text>
      <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{set_password_attempt_1(string_value)}}
      value={password_string_attempt_1}
      placeholder="Confirm Password"
      ></TextInput>
      <View style={styles.ButtonPair}>
      <View style={styles.ButtonTemplate}>
      <Button
      title = 'Set Password'
      onPress = {async ()=>{
        if (password_string.length < 3 || password_string_attempt_1.length < 3){
          Alert.alert('Password must have minimum length of 3 !');
      }
      else{
          if(password_string_attempt_1 == password_string){
            await permission_reqused_fn();
            if (goto_overall_screen== true){
            let key_json = {password:password_string}
            await encryption_and_write("", JSON.stringify(key_json,"utf-8"),storage_file_key_path );
            await encryption_and_write(password_string, JSON.stringify(data_json,"utf-8"),storage_file_data_path );
            Alert.alert('Successful','Password is successfully created.');
            navigation.pop();
            navigation.replace("LoginScreen"); 
          }
            else{
              permission_reqused_fn();
            }
          }
          else{
            Alert.alert('Passwords do not match !','Create Password does not match with Confirm Password.');
          }
      }
    }}
      />
      </View>
      </View>
    </View>
  )
}

export default CreateScreen

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
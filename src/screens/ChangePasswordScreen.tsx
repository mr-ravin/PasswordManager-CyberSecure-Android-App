import { Button,  TextInput, StyleSheet, Text, View, Alert, PermissionsAndroid, Platform  } from 'react-native'
import React, { useState } from 'react'
import RNFS from 'react-native-fs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import { writeFile } from 'react-native-fs'
import Aes from 'react-native-aes-crypto'

type ChangePasswordProps = NativeStackScreenProps<RootStackParamList, 'ChangePasswordScreen'>

const ChangePasswordScreen = ({navigation, route}: ChangePasswordProps) => {
  let goto_overall_screen = true
  const {ExistingPassword} = route.params

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
    if (granted=== PermissionsAndroid.RESULTS.GRANTED|| Number(Platform.Version) >=33){
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
  const [previous_password_string, set_previous_password] = useState('');
  const [password_string, set_password] = useState('');
  const [password_string_attempt_1, set_password_attempt_1] = useState('');
  const storage_file_key_path = RNFS.DocumentDirectoryPath+'/PasswordManagerKey.json'
  const storage_file_data_path = RNFS.DocumentDirectoryPath+'/PasswordManagerData.json';
  return (
    <View style={styles.container}>
      <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={false}
      onChangeText = {(string_value)=>{set_previous_password(string_value)}}
      value={previous_password_string}
      placeholder="Current Password"
      ></TextInput>
      <Text> </Text>
     <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{set_password(string_value)}}
      value={password_string}
      placeholder="Create New Password"
      ></TextInput>
      <Text> </Text>
      <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{set_password_attempt_1(string_value)}}
      value={password_string_attempt_1}
      placeholder="Confirm New Password"
      ></TextInput>      
      <View style={styles.ButtonPair}>
      <View style={styles.ButtonTemplate}>
      <Button
      title = 'Set Password'
      onPress = {async ()=>{
      if(previous_password_string != ExistingPassword){
        Alert.alert('Passwords do not match !','Current Password does not match with Existing Password.');
      }
      else{
            if (password_string.length < 3){
              Alert.alert('New Password must have minimum length of 3 !');
            }
            else{
                if(password_string == password_string_attempt_1){
                  await permission_reqused_fn();
                  if (goto_overall_screen== true){
                  let key_json = {password:password_string}
                  await encryption_and_write("",JSON.stringify(key_json,"utf-8"),storage_file_key_path);
                  let data_json = await RNFS.readFile(storage_file_data_path);
                  let decrypt_data_json_string = await decryption_and_read(previous_password_string, data_json);
                  await encryption_and_write(password_string,decrypt_data_json_string,storage_file_data_path);
                  Alert.alert('Successful','Password is successfully changed.');
                  navigation.pop();
                  navigation.replace("LoginScreen");
                }
                  else{
                    permission_reqused_fn();
                  }
                }
                else{
                  Alert.alert('Passwords do not match !','Create New Password does not match with Confirm New Password.');
                }
            }
          }
      }}
      />
      </View>
      </View>
    </View>
  )
}

export default ChangePasswordScreen

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
        color: "black"
    },
    ButtonPair:{
        flexDirection: 'row',
        marginTop: 10,
    },
    ButtonTemplate:{
        margin: 10
    }
})
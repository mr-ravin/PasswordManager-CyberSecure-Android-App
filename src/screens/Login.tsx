import { Button,  TextInput, StyleSheet, Text, View, Alert, PermissionsAndroid, ActivityIndicator, Platform } from 'react-native'
import React, { useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import RNFS from 'react-native-fs'
import Icon from 'react-native-vector-icons/FontAwesome6'
import Aes from 'react-native-aes-crypto'
type LoginProps = NativeStackScreenProps<RootStackParamList, 'LoginScreen'>

const LoginScreen = ({navigation}: LoginProps) => {
    const storage_file_path = RNFS.DocumentDirectoryPath+'/PasswordManagerKey.json';
    const [password_string, set_password] = useState('');
    const [fileData, setFileData] = useState("NO-LOADING-DONE");
    const [visible, set_visible_menu] = useState(false);
    const showMenu = () =>{set_visible_menu(true)}
    const hideMenu = () =>{set_visible_menu(false)}
  
    const decryption_and_read = async (key: string, message_string: string, count = 500)=> {
      let  Mainkey = "MasterPassword"
      if (key!=""){
       Mainkey = key
      }
      const initialization_vector = "21081993000000000000000039918012"
      const first_key = await Aes.pbkdf2(Mainkey, "AESsalt", count, 256);
      const decrypted_data = await Aes.decrypt(message_string, first_key, initialization_vector, 'aes-256-cbc');
      return decrypted_data
    }

    const permission_reqused_fn = async() =>{
try{
  const granted_read = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    {
        title: "Storage Read Permisison: ",
        message:"This app requires storage permission for importing app data.",
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK'
    }
);
const granted_write = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
        title: "Storage Write Permisison: ",
        message:"This app requires storage permission in order to store data on device.",
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK'
    }
);
if ((granted_write === PermissionsAndroid.RESULTS.GRANTED && granted_read === PermissionsAndroid.RESULTS.GRANTED )||  Number(Platform.Version) >=33){
}
else{
    Alert.alert("Storage Permission is not granted.");
}}catch(err){
    Alert.alert("Storage Permission is not granted.");
}
}

const readFile = async (path : string, mode : string) => {
    RNFS.exists(path).then(async (is_existing)=>{
    if (is_existing){
      let response = await RNFS.readFile(path);
      response = await decryption_and_read("", response);
      setFileData(response);
    }
    else{
      setFileData("NO-FILE-EXIST");
      if(mode!="at_load"){
      Alert.alert("Error fetching previous records.");
      }
    }
  }).catch((err)=>{
      if(mode!="at_load"){
      Alert.alert("Error fetching previous records.");
      }
  });}

  permission_reqused_fn();
  
  if (fileData == "NO-LOADING-DONE"){
    readFile(storage_file_path,"at_load");
    return(<View style={[styles.container, styles. ButtonInputPair]}>
        <ActivityIndicator size="large" color="#0000FF"/>
    </View>)
  }
  else{
  return (
    <View style={styles.container}>
    <View style={styles. ButtonInputPair}>
     <TextInput style={styles.PasswordInput}
      maxLength={101}
      placeholderTextColor="grey"
      secureTextEntry={true}
      onChangeText = {(string_value)=>{
        set_password(string_value)}}
      value={password_string}
      placeholder="Enter Password"
      ></TextInput>
      
      <View style={styles.ButtonTemplate}>
      <Button
      title = 'Login'
      onPress = {()=>{
       if(fileData=="NO-FILE-EXIST"){
        Alert.alert("Kindly create a password first.", "Goto the Menu button shown at right bottom: \nMenu > Create Password.");
       }
        else{if (password_string.length < 3){
            Alert.alert('Password must have minimum length of 3 !');
        }
        else{
        try{
        let json_data = JSON.parse(fileData);       
        if (password_string!=json_data["password"]){
            Alert.alert('Wrong password !')
        }
        else{
        permission_reqused_fn();
        // login successfull

        navigation.navigate("OverallScreen",{
        ScreenMode: "LAUNCH",
        AppPassword: password_string,
        Id: "",
        Title: "",
        Username: "",
        Password: "",
        Url: "",
        Notes: "" })
        set_password('');
      }
    }catch(err){}        
    }}}
      }
      />
      </View>
      </View>
      <View style={styles.SettingIcon}>    
      <Menu
              visible={visible}
              anchor={<Text onPress={showMenu}><Icon name="gear" size={43} color={"#555555"}></Icon></Text>}
              onRequestClose={hideMenu}
            >
      <MenuItem onPress={()=>{
        Alert.alert("WARNING !!!", "Creating new password will remove any previously stored data of this app.\n\nIMPORTANT: If the user forgets the created password, or this app is deleted then the previously data stored of this app will not be recoverable ! \n\nA user can always reset the app by creating a new password.",
        [ {
                text: "Proceed",
                onPress:()=>{

                            hideMenu();       
                            navigation.navigate("CreateScreen");
                },
            },
        {
            text: "Cancel",
            onPress:()=>{},
        }]);
        }}><Text style={styles.MenuTextColor}>Create Password</Text>
        </MenuItem>      
        <MenuDivider />
        <MenuItem onPress={()=>{hideMenu(); 
        if (fileData == "NO-FILE-EXIST"){
            Alert.alert("Kindly create a password first.", "Select Create Password from this Menu.");
        }
        else{
        let json_data = JSON.parse(fileData);
        navigation.navigate("ChangePasswordScreen",{ExistingPassword: json_data["password"]});
         }
              }}>
                <Text style={styles.MenuTextColor}>Change Password</Text>
      </MenuItem>
      <MenuDivider/>
      <MenuItem onPress={()=>{hideMenu(); 
         if (fileData == "NO-FILE-EXIST"){
          Alert.alert("Kindly create a password first.", "Create a password before trying to transfer data.");
      }
      else{
        Alert.alert("IMPORTANT NOTICE", "1. Exporting Data will save the app data in PasswordManagerData.json file in the user defined location. This file will contain all the data of the app in unencrypted format (i.e. readable text).\n\nTo Export Data:\nClick EXPORT DATA > Select Location where to save the file. \n\n2. Importing Data activity will overwrite the installed app's data by the imported data.\n\nTo Import Data:\nClick IMPORT DATA > Select file to import the data from.\n\nNOTE: Do not forget to delete the file PasswordManagerData.json after importing the data, as it contains app data in readable format.",
        [ {
                text: "Proceed",
                onPress:()=>{
                  let json_data = JSON.parse(fileData);
                  navigation.navigate("DataTransferScreen",{ExistingPassword: json_data["password"]});
                },
            },
        {
            text: "Cancel",
            onPress:()=>{},
        }]);

       }
              }
              }>
                <Text style={styles.MenuTextColor}>Import Export </Text><Icon name="right-left" color={"#555555"}/>
      </MenuItem>
      <MenuDivider/>
      <MenuItem onPress={()=>{Alert.alert("App Developer Details:","Name: Ravin Kumar\nWebsite: https://mr-ravin.github.io"); hideMenu();}}><Text style={styles.MenuTextColor}>About Us </Text><Icon name="face-grin-stars"color={"#555555"}/></MenuItem>
      <MenuDivider/>
      <MenuItem onPress={()=>{hideMenu();}}><Icon name="arrow-left" color={"#555555"}/><Text style={styles.MenuTextColor}> Back</Text></MenuItem>
      </Menu>
      </View>
    
    </View>
  )}
  
}
export default LoginScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        backgroundColor: "lightcyan",
    },
    PasswordInput:{
        borderColor: "gray",
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: "white",
        color: "black"
    },
    ButtonInputPair:{
        margin: 5
    },
    ButtonTemplate:{
        marginTop: 10,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    SettingIcon:{
        flex: 1,
        width: 66,
        height: 66,
        borderRadius: 33,
        justifyContent: 'center',
        alignItems:'center',
        position: 'absolute',
        bottom: 20,
        right: 20
        
    },
    MenuTextColor:{
      color: "#555555"
    }
})
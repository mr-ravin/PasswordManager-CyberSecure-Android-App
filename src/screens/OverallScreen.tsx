import { StyleSheet, Text, View, Alert, TouchableOpacity, FlatList, ActivityIndicator} from 'react-native'
import React, { useState } from 'react'
import RNFS, { writeFile } from 'react-native-fs'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import Icon from 'react-native-vector-icons/FontAwesome6'
import { Menu, MenuItem, MenuDivider } from 'react-native-material-menu';
import { SafeAreaView } from 'react-native-safe-area-context'
import Aes from 'react-native-aes-crypto'

type OverallScreenProps = NativeStackScreenProps<RootStackParamList, 'OverallScreen'>

const OverallScreen = ({navigation, route}: OverallScreenProps) => {
    const {ScreenMode, AppPassword, Id, Title, Username, Password, Url, Notes} = route.params
    const [screen_mode_value, set_screen_mode] = useState(ScreenMode);
    const [selected_menu_id, set_selected_menu_id] = useState(-1);
    const [visible_index, set_visible_index] = useState([false]);
    const [data_json_string, setFileData] = useState("NO-FILE-EXIST");
    const storage_file_data_path = RNFS.DocumentDirectoryPath+'/PasswordManagerData.json';
    const showMenu = (item_index: number) =>{
        let visibility_arr =  new Array() as Array<boolean>;
        for (let i = 0; i<data_json_string.length;i++){
            if (i != item_index){
            visibility_arr.push(false)
            }
            else{
                visibility_arr.push(true)
            }
        }
        set_visible_index(visibility_arr);
    }
    const hideMenu = (item_index: Number) =>{

        let visibility_arr =  new Array() as Array<boolean>;
        for (let i = 0; i<data_json_string.length;i++){
            if (i == item_index){
            visibility_arr.push(false)
            }
        }
        set_visible_index(visibility_arr);

    }
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

    const readFile = (path: string) => {
        RNFS.exists(path).then(async (is_existing)=>{
        if (is_existing){
          let response = await RNFS.readFile(path);
          response = await decryption_and_read(AppPassword, response);
          setFileData(response);
        }
        else{
          Alert.alert("Error fetching previous records.");
        }
      }).catch((err)=>{
          Alert.alert("Error fetching previous records.");
      });}

    const addFunction = async (path: string) => {
        RNFS.exists(path).then(async (is_existing)=>{
            if (is_existing){
                let response = await RNFS.readFile(path);
                response = await decryption_and_read(AppPassword, response);
                setFileData(response);
                let data_json = JSON.parse(data_json_string);
                for(let i=0; i<data_json["data"].length; i++){
                    data_json["data"][i]["Id"] = i.toString();
                }
                data_json["data"].push({
                    Id:data_json["data"].length.toString(),
                    Title: Title,
                    Username: Username,
                    Password: Password,
                    Url: Url,
                    Notes: Notes 
                });
                await encryption_and_write(AppPassword, JSON.stringify(data_json,"utf-8"), path);
                set_screen_mode("LAUNCH");
    
    }}).catch((err)=>{
    });}


    const editFunction = async (path: string, ) => {
        RNFS.exists(path).then(async (is_existing)=>{
            if (is_existing){
                let response = await RNFS.readFile(path);
                response = await decryption_and_read(AppPassword, response);
                setFileData(response);
                let data_json = JSON.parse(data_json_string);
                for(let i=0; i<data_json["data"].length; i++){
                    if(i==Number(Id)){
                        data_json["data"][i] =  {
                        Id:Id,
                        Title: Title,
                        Username: Username,
                        Password: Password,
                        Url: Url,
                        Notes: Notes 
                    }
                    }

                }
                await encryption_and_write(AppPassword, JSON.stringify(data_json,"utf-8"), path);
                //writeFile(storage_file_data_path, JSON.stringify(data_json,"utf-8"));
                set_screen_mode("LAUNCH");
    }}).catch((err)=>{
    });}

    const deleteFunction = async(path: string)=>{
        if(screen_mode_value=="DELETE"){
            if (data_json_string!="NO-FILE-EXIST"){
                let data_json = JSON.parse(data_json_string);
                data_json["data"].splice(selected_menu_id, 1);
                for(let i=0; i<data_json["data"].length; i++){ 
                    data_json["data"][i]["Id"] = i.toString();
                }
                await encryption_and_write(AppPassword, JSON.stringify(data_json,"utf-8"), path);
                set_screen_mode("LAUNCH");
            }
        }
    }
    
    if (screen_mode_value=="ADD"){
        addFunction(storage_file_data_path);
    }
    else
    {
        if (screen_mode_value=="EDIT"){
            editFunction(storage_file_data_path);

        }
        else{
            if (screen_mode_value=="DELETE"){
            deleteFunction(storage_file_data_path);
            }
        }
   }
    if(screen_mode_value=="LAUNCH"){
    readFile(storage_file_data_path);
    if (data_json_string!="NO-FILE-EXIST" && screen_mode_value=="LAUNCH"){
    let data_json = JSON.parse(data_json_string);
    return (
        <SafeAreaView style={styles.Container}>
        <View style={styles.ScrollView}>
        <FlatList 
         data = {data_json["data"]}
         renderItem={({item})=>

            <View style={styles.PairElements}>
                <Text style={styles.Heading}>{item.Title}</Text>
                <View style={styles.ElementIcon}>
                <Menu  ref={item.Id}
                        visible={visible_index[Number(item.Id)]}
                        anchor={<Text onPress={()=>showMenu(Number(item.Id))}><Icon name="bars" size={30} color={"#555555"}/></Text>}
                        onRequestClose={()=>hideMenu(Number(item.Id))}
                        >
                                
                <MenuItem onPress={()=>{hideMenu(Number(item.Id));
                    set_selected_menu_id(Number(item.Id));
                    navigation.navigate("ViewIndividualData",{
                        Title: item.Title,
                        Username: item.Username,
                        Password: item.Password,
                        Url:item.Url,
                        Notes: item.Notes});
                    }}><Icon name="eye" color={"#555555"}/><Text style={styles.MenuTextColor}>  View</Text></MenuItem>
                <MenuDivider/>
                <MenuItem onPress={()=>{hideMenu(Number(item.Id))
                navigation.navigate("AddIndividualData",{
                    DataMode: "EDIT",
                    AppPassword: AppPassword,
                    Id: item.Id,
                    Title: item.Title,
                    Username: item.Username,
                    Password: item.Password,
                    Url:item.Url,
                    Notes: item.Notes});
                }}><Icon name="pencil" color={"#555555"}/><Text style={styles.MenuTextColor}>  Edit</Text></MenuItem>

                <MenuDivider/>
                    <MenuItem onPress={()=>{hideMenu(Number(item.Id));
                    set_selected_menu_id(Number(item.Id));
                    set_screen_mode("DELETE");
                    }}><Icon name="trash" color={"#555555"}/><Text style={styles.MenuTextColor}>  Delete</Text></MenuItem>
                    <MenuDivider/>
                    <MenuItem onPress={()=>{hideMenu(Number(item.Id))}}><Icon name="arrow-left" color={"#555555"}/><Text style={styles.MenuTextColor}>  Back</Text></MenuItem>
                </Menu>


                </View>
            </View>
         }
         keyExtractor={item => item.Id}
        >
        </FlatList>    
        </View>    
        <View style={styles.PlusIconView}>
        <TouchableOpacity style={styles.PlusIcon} onPress={()=>{navigation.navigate("AddIndividualData",{
        DataMode: "ADD",
        AppPassword: AppPassword,
        Id: "",
        Title: "",
        Username: "",
        Password: "",
        Url: "",
        Notes: ""});}}>
        <Icon name="circle-plus" size={55} color={"#555555"}></Icon>
        </TouchableOpacity>
        </View>
        </SafeAreaView>
    )
        }
    }
    else{
    return(
        <View style={styles.Loader}>
            <ActivityIndicator size="large" color="#0000FF"/>
        </View>)
    }
}

export default OverallScreen

const styles = StyleSheet.create({
    Loader:{
        flexGrow:1,
        justifyContent: 'center',
        margin: 5
    },
    Container:{
        flexGrow: 1,
        backgroundColor: "lightcyan",
        justifyContent: 'space-between'
    },
    ScrollView:{
        flex:0,
        marginBottom: 40,
    
    },
    PairElements:{
        backgroundColor: "white",
        flexDirection:"row",
        borderColor: "grey",
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
        margin: 3,
        
    },
    Heading:{
        flexShrink: 1,
        marginRight: 10,
        fontSize: 23,
        alignItems: "flex-start",
        marginStart: 10,
        marginTop: 0,
        marginEnd: 10,
        color: "grey"
    },
    ElementIcon:{
        alignItems:"flex-end",
        marginEnd: 10,
        marginTop: 2, 
        marginLeft: "auto"
    },
    PlusIconView:{
        flex: 1,
        justifyContent: 'flex-end',
        alignSelf:"center" 
    },
    PlusIcon:{
        backgroundColor: "#FFFFFF",
        borderRadius: 33,
        width: 66,
        height: 66,
        justifyContent: 'center',
        alignItems:'center',
    },
    MenuTextColor:{
        color: "#555555"
      }
})
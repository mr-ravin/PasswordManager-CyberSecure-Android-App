import { StyleSheet, Text, TextInput, ScrollView, View, TouchableOpacity} from 'react-native'
import React, {useState} from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import Icon from 'react-native-vector-icons/FontAwesome6'
import { SafeAreaView } from 'react-native-safe-area-context'

type ItemProps = NativeStackScreenProps<RootStackParamList, 'AddIndividualData'>

const AddIndividualData = ({navigation, route}:ItemProps) => {
 const {DataMode, AppPassword, Id, Title, Username, Password, Url, Notes} = route.params
 const [title_string, set_title_string] = useState(Title);
 const [username_string, set_username_string] = useState(Username);
 const [password_string, set_password_string] = useState(Password);
 const [url_string, set_url_string] = useState(Url);
 const [notes_string, set_notes_string] = useState(Notes);
  return (
    <SafeAreaView style={styles.Container}>
    <ScrollView style={styles.ScrollView}>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Title</Text>
            <TextInput style={styles.InputField}
            editable= {true}
            placeholderTextColor="grey"
            maxLength={1000}
            secureTextEntry={false}
            onChangeText = {(string_value)=>{
                            set_title_string(string_value)}
                           }
            value={title_string}
            defaultValue={title_string}
            placeholder="Enter Title"
            >
            </TextInput>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Username</Text>
            <TextInput style={styles.InputField}
            editable= {true}
            placeholderTextColor="grey"
            maxLength={100000}
            secureTextEntry={false}
            onChangeText = {(string_value)=>{
                set_username_string(string_value)}}
            value={username_string}
            defaultValue={username_string}
            placeholder="Enter Username"
            >

            </TextInput>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Password</Text>
            <TextInput style={styles.InputField}
            editable= {true}
            placeholderTextColor="grey"
            maxLength={100000}
            secureTextEntry={false}
            onChangeText = {(string_value)=>{
                set_password_string(string_value)}}
            value={password_string}
            defaultValue={password_string}
            placeholder="Enter Password"
            >

            </TextInput>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Link</Text>
            <TextInput style={styles.InputField}
            editable= {true}
            placeholderTextColor="grey"
            maxLength={100000}
            secureTextEntry={false}
            onChangeText = {(string_value)=>{
                set_url_string(string_value)}}
            value={url_string}
            defaultValue={url_string}
            placeholder="Enter Link"
            >
            </TextInput>
      </View>

      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Notes</Text>
            <TextInput style={styles.InputField}
            editable= {true}
            placeholderTextColor="grey"
            maxLength={100000}
            multiline={true}
            numberOfLines={5}
            secureTextEntry={false}
            onChangeText = {(string_value)=>{
                set_notes_string(string_value)}}
            value={notes_string}
            defaultValue={notes_string}
            placeholder="Enter Notes"
            >
            </TextInput>
      </View>   

    </ScrollView>

    {   (title_string!="" || username_string!="" || password_string!="" || url_string!="" || notes_string!="" ) && <View style={styles.SaveIconView}>
        <TouchableOpacity style={styles.SaveIcon}onPress={()=>{
        navigation.pop();
        navigation.replace("OverallScreen", {
        ScreenMode: DataMode,
        AppPassword: AppPassword,
        Id: Id,
        Title: title_string,
        Username: username_string,
        Password: password_string,
        Url: url_string,
        Notes: notes_string })}}>
        <Icon name="circle-check" size={55} color={"#555555"}></Icon>
        </TouchableOpacity>
        </View>
    }
    </SafeAreaView>
  )
}

export default AddIndividualData

const styles = StyleSheet.create({
    Container:{
        flexGrow: 1,
        backgroundColor: "lightcyan",
        justifyContent: 'space-between'
    },
    ScrollView:{
        marginBottom: 40,
    },
    ItemPair:{
        margin: 5,
    },
    InputField:{
        backgroundColor: "white",
        borderColor: "grey",
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        color: "black"
    },
    Heading:{
        margin: 2,
        fontSize: 21,
        color: "#000000",
    },
    SaveIconView:{
        flex: 1,
        justifyContent: 'flex-end',
        alignSelf:"center"        
    },
    SaveIcon:{
        backgroundColor: "#FFFFFF",
        borderRadius: 33,
        width: 66,
        height: 66,
        justifyContent: 'center',
        alignItems:'center',
    }
})
import { StyleSheet, Text, ScrollView, View } from 'react-native'
import React, {useState} from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import {RootStackParamList} from '../App'
import { SafeAreaView } from 'react-native-safe-area-context'

type ItemProps = NativeStackScreenProps<RootStackParamList, 'ViewIndividualData'>

const ViewIndividualData = ({navigation, route}:ItemProps) => {
 const {Title, Username, Password, Url, Notes} = route.params
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
            <Text style={styles.InputField}>{title_string}</Text>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Username</Text>
            <Text style={styles.InputField}>{username_string}</Text>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Password</Text>
            <Text style={styles.InputField}>{password_string}</Text>
      </View>
      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Link</Text>
            <Text style={styles.InputField}>{url_string}</Text>
      </View>

      <View style={styles.ItemPair}>
            <Text style={styles.Heading}>Notes</Text>
            <Text style={styles.InputField}>{notes_string}</Text>
      </View>   

    </ScrollView>
    </SafeAreaView>
  )
}

export default ViewIndividualData

const styles = StyleSheet.create({
    Container:{
        flexGrow: 1,
        backgroundColor: "lightcyan",
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
    }
})
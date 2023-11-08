import { StyleSheet} from 'react-native'
import React from 'react'
import {NavigationContainer} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import CreateScreen from './screens/Create'
import LoginScreen from './screens/Login'
import OverallScreen from './screens/OverallScreen'
import AddIndividualData from './screens/AddIndividualData'
import ViewIndividualData from './screens/ViewIndividualData'
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import DataTransferScreen from './screens/DataTransferScreen'

export type RootStackParamList = {
  CreateScreen: undefined;
  LoginScreen: undefined;
  OverallScreen: {ScreenMode: string,
                  AppPassword: string,
                  Id: string,
                  Title: string,
                  Username: string,
                  Password: string,
                  Url: string,
                  Notes: string 
                  },
  AddIndividualData:{
    DataMode: string,
    AppPassword: string,
    Id: string,
    Title: string,
    Username: string,
    Password: string,
    Url: string,
    Notes: string 
  },
  ViewIndividualData:{
    Title: string,
    Username: string,
    Password: string,
    Url: string,
    Notes: string 
  },
  ChangePasswordScreen: {ExistingPassword: string},
  DataTransferScreen: {ExistingPassword: string}

}
const Stack = createNativeStackNavigator<RootStackParamList>()
const App = () => {

  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='LoginScreen'>
        <Stack.Screen 
        name="LoginScreen"
        component={LoginScreen}
        options={
          {
            title: "Password Manager"
          }
        }
        />
        <Stack.Screen 
        name="CreateScreen"
        component={CreateScreen}
        options={
          {
            title: "Set Password"
          }
        }
        />
        <Stack.Screen 
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
        options={
          {
            title: "Change Password"
          }
        }
        />
        <Stack.Screen 
        name="DataTransferScreen"
        component={DataTransferScreen}
        options={
          {
            title: "Data Transfer"
          }
        }
        />
        <Stack.Screen 
        name='OverallScreen'
        component={OverallScreen}
        options={
          {
            title: "Password Manager"
          }
        }
        />
        <Stack.Screen 
        name='AddIndividualData'
        component={AddIndividualData}
        options={
          {
            title: "Add Details"
          }
        }
        />
        <Stack.Screen 
        name='ViewIndividualData'
        component={ViewIndividualData}
        options={
          {
            title: "View Details"
          }
        }
        />
    </Stack.Navigator>
  </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({})
import React, { FC, useState, useEffect } from 'react';
import { Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';

import GhostWriterSimple from './components/ghost-writer-simple';
import styles from './components/styles';
import { enableScreens } from 'react-native-screens';


export default function App() {
  const [text, setText] = useState('');

  const HomeScreen :FC = () => {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} style={{flex:1}}>
        <View style={styles.container}>
          <Text style={styles.titleText}>Ghost Writer</Text>

          <GhostWriterSimple seedText={text}></GhostWriterSimple>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  if (Platform.OS === 'macos') {
    return (
      <HomeScreen></HomeScreen>
    );
  }
  else {
    enableScreens();
    const Stack = createStackNavigator();

    const linking = {
      prefixes: [
        Linking.createURL('/'),
        'https://app.ghost_writer.com',
        'exps://app.ghost_writer.com',
      ],
    }; 
    const checkInitialURL = async () => {
      let {path, queryParams} = await Linking.parseInitialURLAsync();
      if (queryParams && queryParams.text)
      {
        console.log("Initial URL:", path, queryParams);
        setText(queryParams.text);
      }
    }
    Linking.addEventListener('url', (event) => {
      let { path, queryParams } = Linking.parse(event.url);
      if (queryParams && queryParams.text)
      {
        console.log("URL Event:", path, queryParams);
        setText(queryParams.text);
      }
    })
  
    useEffect(() => {
      checkInitialURL();
    });

    return (
      <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: !1 }}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

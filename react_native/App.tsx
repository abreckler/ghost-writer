import React, { useState, useEffect } from 'react';
import { Dimensions, GestureResponderEvent, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native';
import * as Linking from 'expo-linking';

import GhostWriterSimple from './components/ghost-writer-simple';
import { styles }from './components/styles';


export default function App() {
  const [text, setText] = useState('');

  const touchOutsideInput = (evt: GestureResponderEvent) => {
    if (Platform.OS === 'web') {
      return;
    }
    Keyboard.dismiss();
  }
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
  });

  useEffect(() => {
    checkInitialURL();
  });

  const { width, height } = Dimensions.get('window');

  return (
    <TouchableWithoutFeedback onPress={touchOutsideInput} accessible={false}>
      <View style={[styles.container, { maxHeight: height + 'px' }]}>
        <Text style={styles.titleText}>Ghost Writer</Text>

        <GhostWriterSimple seedText={text}></GhostWriterSimple>
      </View>
    </TouchableWithoutFeedback>
  );
}

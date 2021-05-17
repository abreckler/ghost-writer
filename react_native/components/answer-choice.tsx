import React, { FC } from 'react';
import { Alert, TextStyle, Text, TouchableOpacity, View, Image, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Clipboard from 'expo-clipboard';

import { CompletionChoice } from './lib/types';
import { styles } from './styles';

interface IAnswerChoiceProps {
  choice?: CompletionChoice;
  onPress? (e: any): void;
  style?: TextStyle;
  html?: boolean;
  disabled?: boolean;
}

const AnswerChoice: FC<IAnswerChoiceProps> = (props) => {

  const copyTextToClipboardWeb = (text: string) => {
    let success = false;
    const textField = document.createElement('textarea');
    textField.value = text;
    document.body.appendChild(textField);
    textField.select();
    try {
      document.execCommand('copy');
      success = true;
    } catch (e) {}
    document.body.removeChild(textField);
    return success;
  }

  const answerclicked = async () => {
    if (Platform.OS === 'web') {
      // NOTE: currently expo-clipboard package (version: 1.0.2) has a bug.
      // The bug is causing the new lines being truncated and not being copied into clipboard.
      // So for now we will use our own function
      copyTextToClipboardWeb(props.choice?.text || '');
    } else {
      Clipboard.setString(props.choice?.text || '');
    }
    Alert.alert('Answer is copied to the clipboard!');
  };
  
  return (
    props.html || props.choice?.html ?
      (
        <View style={[styles.answerChoice, props.style]}>
          <WebView style={styles.answerChoiceText} javascriptEnabled={false} source={{html: props.choice?.text || ''}}></WebView>
          <View style={[styles.answerChoiceActions, { display: props.disabled ? 'none' : 'flex' }]}>
            <TouchableOpacity onPress={answerclicked}>
              <Image source={require('../assets/copy-solid.png')} style={{height: 20, width: 20}} resizeMode="center" />
            </TouchableOpacity>
          </View>
        </View>
      )
      :
      (
        <View style={[styles.answerChoice, props.style]}>
          <Text style={styles.answerChoiceText}>{props.choice?.text || ''}</Text>
          <View style={[styles.answerChoiceActions, { display: props.disabled ? 'none' : 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
            <TouchableOpacity onPress={answerclicked}>
              <Image source={require('../assets/copy-solid.png')} style={{height: 20, width: 20}} resizeMode="center" />
            </TouchableOpacity>
          </View>
        </View>
      )
  );
}

export { IAnswerChoiceProps, AnswerChoice };
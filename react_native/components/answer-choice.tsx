import React, { FC } from 'react';
import { TextStyle, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { CompletionChoice } from './lib/types';
import { styles } from './styles';

interface IAnswerChoiceProps {
  choice?: CompletionChoice;
  onPress(e: any): void;
  style?: TextStyle;
  html?: boolean;
}

const AnswerChoice: FC<IAnswerChoiceProps> = props => (
  props.html || props.choice?.html ?
    (
      <TouchableOpacity onPress={props.onPress} style={[styles.answerChoice, props.style]}>
        <WebView style={styles.answerChoiceText} javascriptEnabled={false} source={{html: props.choice?.text || ''}}></WebView>
      </TouchableOpacity>
    )
    :
    (
      <TouchableOpacity onPress={props.onPress} style={[styles.answerChoice, props.style]}>
        <Text style={styles.answerChoiceText}>{props.choice?.text || ''}</Text>
      </TouchableOpacity>
    )
);

export { IAnswerChoiceProps, AnswerChoice };
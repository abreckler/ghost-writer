import React, { FC } from 'react';
import { TextStyle, Text, TouchableOpacity } from 'react-native';
import styles from './styles';

interface IAnswerChoiceProps {
  choice?: any;
  onPress(e: any): void;
  style?: TextStyle;
}

const AnswerChoice: FC<IAnswerChoiceProps> = props => (
  <TouchableOpacity onPress={props.onPress} style={[styles.answerChoice, props.style]}>
      <Text style={styles.answerChoiceText}>{props.choice.text.trim()}</Text>
  </TouchableOpacity>
);

export { IAnswerChoiceProps, AnswerChoice };
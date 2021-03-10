import React, { FC } from 'react';
import { Alert, FlatList, ListRenderItem, SafeAreaView, Text } from 'react-native';
import Clipboard from 'expo-clipboard';

import { AnswerChoice } from './answer-choice';
import { CompletionChoice } from './openai';
import styles from './styles';

interface IAnswerListProps {
  data?: CompletionChoice[];
  answersAlert?: string;
}

const AnswerList: FC<IAnswerListProps> = props => {

  const answerclicked = (choice: CompletionChoice) => {
    Clipboard.setString(choice.text || '');
    Alert.alert('Answer is copied to the clipboard!');
  };

  const renderAnswerChoice : ListRenderItem<CompletionChoice> = (info) => {
    return (
      <AnswerChoice
        choice={info.item}
        onPress={() => answerclicked(info.item)}
        style={{}}
      />
    );
  };

  return (
    <SafeAreaView style={styles.answerChoiceListContainer}>
      <Text style={styles.answersAlert}>{props.answersAlert}</Text>
      <FlatList style={styles.answerChoiceList}
        data={props.data}
        renderItem={renderAnswerChoice}
        keyExtractor={item => item.index?.toString() || Math.random().toString()}
      />
    </SafeAreaView>
  );
}

export { IAnswerListProps, AnswerList };
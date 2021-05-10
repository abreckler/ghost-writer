import React, { FC } from 'react';
import { Alert, FlatList, ListRenderItem, StyleProp, Text, View, ViewStyle } from 'react-native';
import Clipboard from 'expo-clipboard';

import { AnswerChoice } from './answer-choice';
import { CompletionChoice } from './lib/types';
import { styles } from './styles';

interface IAnswerListProps {
  data?: CompletionChoice[];
  noAnswerAlert?: string;
  style?: StyleProp<ViewStyle>;
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
    <View style={props.style}>
      {
        typeof props.data !== 'undefined' && props.data.length == 0 && (
          <View>
            <Text style={styles.answersAlert}>{props.noAnswerAlert}</Text>
          </View>
        )
      }
      <FlatList style={styles.answerChoiceList}
        data={props.data}
        renderItem={renderAnswerChoice}
        keyExtractor={item => item.index?.toString() || Math.random().toString()}
      />
    </View>
  );
}

export { IAnswerListProps, AnswerList };
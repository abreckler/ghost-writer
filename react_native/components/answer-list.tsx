import React, { FC } from 'react';
import { FlatList, ListRenderItem, StyleProp, Text, View, ViewStyle } from 'react-native';

import { AnswerChoice } from './answer-choice';
import { CompletionChoice } from './lib/types';
import { styles } from './styles';

interface IAnswerListProps {
  data?: CompletionChoice[];
  noAnswerAlert?: string;
  style?: StyleProp<ViewStyle>;
  html?: boolean;
  placeholder ?: string;
}

const AnswerList: FC<IAnswerListProps> = props => {

  const renderAnswerChoice : ListRenderItem<CompletionChoice> = (info) => {
    return (
      <AnswerChoice
        choice={info.item}
        style={{}}
        html={props.html}
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
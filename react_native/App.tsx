import React, { useState, FC, useEffect } from 'react';
import {
  FlatList, SafeAreaView, StyleSheet,
  TextStyle, Text, TextInput, TouchableOpacity,
  View, ListRenderItem, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';

import { CompletionChoice, OpenAiApiClient, CompletionParams } from './openai';

interface IAnswerChoiceProps {
  choice?: any;
  onPress(e: any): void;
  style?: TextStyle;
};

const AnswerChoice: FC<IAnswerChoiceProps> = props => (
  <TouchableOpacity onPress={props.onPress} style={[styles.answerChoice, props.style]}>
    <Text style={styles.answerChoiceText}>{props.choice.text.trim()}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [text, setText] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [answersAlert, setAnswersAlert] = useState('');
  const [data, setData] = useState([] as CompletionChoice[]);

  const apiClient = new OpenAiApiClient('sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4', 'davinci');
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

  /**
   * Calculate max_tokens to be passed on API call, based on text selection
   * NOTE: One token is roughly 4 characters for normal English text
   */
  const calculateTokens = () : Number => {
    // Now suggestion text will be rougly the same length as the selected text.
    return Math.min(Math.ceil(text.length / 4), 1024);
  }

  const createCompletion = async () => {
    setButtonDisabled(true);

    let params = {
      prompt: text,
      n: 2,
      max_tokens: calculateTokens()
    } as CompletionParams;

    let json = await apiClient.completion(params);

    if (json.choices) {
      setData(json.choices);
      setAnswersAlert('Ghost Writer has ' + json.choices.length + (json.choices.length > 1 ? ' answers' : 'answer') + '!');
    } else {
      setData([]);
      setAnswersAlert('Ghost Writer could not suggest an answer!');
    }

    setButtonDisabled(false);
  };

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
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Ghost Writer</Text>
        <TextInput style={styles.mainInput}
            multiline = {true}
            placeholder="Type here!"
            onChangeText={text => setText(text)}></TextInput>
        <TouchableOpacity style={styles.button}
            disabled={buttonDisabled}
            onPress={createCompletion} >
          <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
        </TouchableOpacity>
        <SafeAreaView style={styles.answerChoiceListContainer}>
          <Text style={styles.answersAlert}>{answersAlert}</Text>
          <FlatList style={styles.answerChoiceList}
            data={data}
            renderItem={renderAnswerChoice}
            keyExtractor={item => item.index?.toString() || Math.random().toString()}
          />
        </SafeAreaView>
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

const mainFontSize = 16;
const bgColor = '#fff';
const textColor = '#444';
const borderColor = '#ccc';
const primaryColor = 'rgb(70, 48, 235)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  titleText: {
    fontSize: mainFontSize * 1.8,
    color: textColor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  mainInput: {
    flex: .4,
    width: '100%',
    padding: mainFontSize,
    fontSize: mainFontSize,
    color: textColor,
    borderColor: borderColor,
    borderWidth: 1,
  },

  button: {
    backgroundColor: primaryColor,
    padding: mainFontSize,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    fontSize: mainFontSize * 1.25,
    color: '#fff',
  },

  answerChoiceListContainer: {
    flex: .4,
    flexGrow: 1,
    width: '100%',
  },
  answersAlert: {
    fontSize: mainFontSize * .9,
  },
  answerChoiceList: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: mainFontSize,
  },
  answerChoice: {
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
    padding: mainFontSize / 2,
  },
  answerChoiceText: {
    fontSize: mainFontSize,
    color: textColor,
  },
});

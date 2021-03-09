import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';

import styles from './components/styles';
import { AnswerList } from './components/answer-list';
import { CompletionChoice, OpenAiApiClient, CompletionParams } from './components/openai';


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
      n: 1,
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
        <AnswerList data={data} answersAlert={answersAlert} ></AnswerList>
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

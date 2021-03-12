import React, { useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';

import styles from './components/styles';
import { AnswerList } from './components/answer-list';
import { CompletionChoice, OpenAiApiClient, CompletionParams } from './components/openai';
import { Picker } from '@react-native-picker/picker';


export default function App() {
  const [writingMode, setWritingMode] = useState('autocomplete');
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
  const calculateTokens = () : number => {
    // Now suggestion text will be rougly the same length as the selected text.
    let base = Math.min(Math.ceil(text.length / 4), 1024);
    if (writingMode === 'qa') {
      // typically the questions are shorter than the answer, so we apply some multiplication to the max tokens
      return Math.min(base * 2, 1024);
    } else {
      return base;
    }
  }

  const createCompletion = async () => {
    if (text.trim().length < 10) {
      Alert.alert("Please enter seed text!");
      return;
    }

    setButtonDisabled(true);

    let params = {} as CompletionParams;
    let engine = 'davinci';
    if (writingMode === 'rewrite')
    {
      params.prompt = text.trim();
    }
    else if(writingMode === 'qa')
    {
      params.prompt = 'Q: ' + text.trim() + '\nA:';
      params.stop = ['Q:'];
    }
    else { // autocomplete
      params.prompt = text.trim();
    }
    params.n = 1;
    params.max_tokens = calculateTokens();

    let json = await apiClient.completion(params, engine);

    if (json.choices) {
      setData(json.choices);
      setAnswersAlert('Ghost Writer has ' + json.choices.length + (json.choices.length > 1 ? ' answers' : ' answer') + '!');
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
        <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity style={styles.button}
              disabled={buttonDisabled}
              onPress={createCompletion} >
            <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
          </TouchableOpacity>
          <Picker
              selectedValue={writingMode}
              style={styles.modePicker}
              onValueChange={(itemValue, itemIndex) => setWritingMode(itemValue.toString())}>
            <Picker.Item label="Auto-complete" value="autocomplete" />
            <Picker.Item label="Re-write" value="rewrite" />
            <Picker.Item label="Q&A" value="qa" />
          </Picker>
        </View>
        <AnswerList data={data} answersAlert={answersAlert} ></AnswerList>
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

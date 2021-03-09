import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Modal, Alert } from 'react-native';
import ShareExtension from 'react-native-share-extension';
import * as Linking from 'expo-linking';
import { CompletionChoice, CompletionParams, OpenAiApiClient } from './components/openai';
import { AnswerList } from './components/answer-list';
import styles from './components/styles';


export default function ShareExt() {
  const [isOpen, setOpen] = useState(true);
  const [dataType, setDataType] = useState('');
  const [sharedValue, setSharedValue] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [answersAlert, setAnswersAlert] = useState('');
  const [answers, setAnswers] = useState([] as CompletionChoice[]);

  const apiClient = new OpenAiApiClient('sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4', 'davinci');

  const getSharedData = async () => {
    try {
      const {type, value} = await ShareExtension.data()
      setDataType(type);
      setSharedValue(value);
      Alert.alert('Complete: ' + value);
    }
    catch(e) {
      Alert.alert('Error' + e);
      console.log('error', e);
    }
  }

  useEffect(() => {
    getSharedData();
  });

  const closing = () => {
    setOpen(false);
    ShareExtension.close();
  };

  const invokeGhostWriter = async () => {
    try {
      let url = Linking.makeUrl('/', { text: sharedValue });
      console.error("tried to open url:" + url);
      ShareExtension.openURL(url);
    }
    catch (e)
    {
      Alert.alert("Could not open the host app!");
    }
  }

  /**
   * Calculate max_tokens to be passed on API call, based on text selection
   * NOTE: One token is roughly 4 characters for normal English text
   */
  const calculateTokens = () : Number => {
    // Now suggestion text will be rougly the same length as the selected text.
    return Math.min(Math.ceil(sharedValue.length / 4), 1024);
  }

  const createCompletion = async () => {
    setButtonDisabled(true);

    let params = {
      prompt: sharedValue,
      n: 1,
      max_tokens: calculateTokens()
    } as CompletionParams;

    let json = await apiClient.completion(params);

    if (json.choices) {
      setAnswers(json.choices);
      setAnswersAlert('Ghost Writer has ' + json.choices.length + (json.choices.length > 1 ? ' answers' : 'answer') + '!');
      setButtonDisabled(false);
    } else {
      setAnswers([]);
      setAnswersAlert('Ghost Writer could not suggest an answer!');
      setButtonDisabled(false);
    }
  };
  

  return (
    <Modal style={styles.extModal} transparent={true} animationType="slide" visible={isOpen} onRequestClose={closing}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Ghost Writer</Text>
        <TextInput style={styles.mainInput}
            multiline = {true}
            placeholder="Type here!"
            value = { sharedValue }
            onChangeText={ text => setSharedValue(text) }></TextInput>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity style={styles.button}
              disabled={ buttonDisabled }
              onPress={ createCompletion } >
            <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}
              disabled={ buttonDisabled }
              onPress={ closing } >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <AnswerList data={answers} answersAlert={answersAlert} ></AnswerList>
      </View>
    </Modal>
  );
}

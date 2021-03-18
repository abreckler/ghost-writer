import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Modal, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Linking from 'expo-linking';
import ShareExtension from 'react-native-share-extension';

import styles from './components/styles';
import { CompletionChoice, CompletionParams, GhostWriterConfig, OpenAiApiClient } from './components/openai';
import { AnswerList } from './components/answer-list';


export default function ShareExt() {
  const [isOpen, setOpen] = useState(true);
  const [dataType, setDataType] = useState('');
  const [sharedValue, setSharedValue] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [writingMode, setWritingMode] = useState('autocomplete');
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

  const createCompletion = async () => {
    setButtonDisabled(true);

    let params = GhostWriterConfig.generateCompleteParams(sharedValue.trim(), writingMode);
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

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  }

  return (
    <Modal style={styles.extModal} transparent={true} animationType="slide" visible={isOpen} onRequestClose={closing}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Ghost Writer</Text>
        <TextInput style={styles.mainInput}
            multiline = {true}
            placeholder="Type here!"
            value = { sharedValue }
            onChangeText={ text => setSharedValue(text) }></TextInput>
        
        <View style={[styles.settingsContainer, { display: settingsVisible ? 'flex' : 'none' }]}>
          <Text style={styles.settingsLabel}>Mode:</Text>
          <Picker
              selectedValue={writingMode}
              style={styles.modePicker}
              mode='dropdown'
              onValueChange={(itemValue, itemIndex) => setWritingMode(itemValue.toString())}>
            <Picker.Item label="Auto-complete" value="autocomplete" />
            <Picker.Item label="Re-write" value="rewrite" />
            <Picker.Item label="Q&A" value="qa" />
          </Picker>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button}
              disabled={buttonDisabled}
              onPress={createCompletion} >
            <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
            <ActivityIndicator size="small" hidesWhenStopped={true} animating={buttonDisabled} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleSettingsView}>
            <Text style={styles.buttonText}>Mode</Text>
          </TouchableOpacity>
        </View>

        <AnswerList data={answers} answersAlert={answersAlert} style={styles.answerChoiceListContainer}></AnswerList>

      </View>
    </Modal>
  );
}

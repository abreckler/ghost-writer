import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Linking from 'expo-linking';

import styles from './styles';
import { EngineID, CompletionChoice, OpenAiApiClient, GhostWriterConfig } from './openai';
import { AnswerList } from './answer-list';

interface GhostWriterSimpleProps {
  seedText: string,
}

const GhostWriterSimple: FC<GhostWriterSimpleProps> = (props: GhostWriterSimpleProps) => {
  const [writingMode, setWritingMode] = useState('autocomplete');
  const [text, setText] = useState(props.seedText || '');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [answersAlert, setAnswersAlert] = useState('');
  const [answers, setAnswers] = useState([] as CompletionChoice[]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const apiClient = new OpenAiApiClient('sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4', EngineID.Curie);

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

  const createCompletion = async () => {
    if (text.trim().length < 10) {
      Alert.alert("Please enter seed text!");
      return;
    }

    setButtonDisabled(true);

    let params = GhostWriterConfig.generateCompleteParams(text.trim(), writingMode);

    let json = await apiClient.completion(params);

    if (json.choices) {
      setAnswers(json.choices);

      if (writingMode === 'rewrite')
        setAnswersAlert('Ghost Writer has' + json.choices.length + (json.choices.length > 1 ? ' suggestions' : ' suggestion') + ' to rewrite above text!');
      else if (writingMode === 'qa')
        setAnswersAlert('Ghost Writer suggests ' + json.choices.length + (json.choices.length > 1 ? ' answers' : ' answer') + '!');
      else
        setAnswersAlert('Ghost Writer has ' + json.choices.length + (json.choices.length > 1 ? ' suggestions' : ' suggestion') + '!');

    } else {
      setAnswers([]);
      setAnswersAlert('Ghost Writer could not suggest an answer!');
    }

    setButtonDisabled(false);
  };

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  }
  
  return (
    <>
      <View style={styles.mainInputContainer}>
        <TextInput style={styles.mainInput}
            multiline = {true}
            placeholder="Type here!"
            onChangeText={text => setText(text)}></TextInput>
      </View>

      <View style={[styles.settingsContainer, { display: settingsVisible ? 'flex' : 'none' }]}>
        <Text style={styles.settingsLabel}>Mode:</Text>
        <Picker
            selectedValue={writingMode}
            style={styles.modePicker}
            itemStyle={styles.modePickerItemStyle}
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
    </>
  );
}

export default GhostWriterSimple;
import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Linking from 'expo-linking';

import styles from './styles';
import { EngineID, CompletionChoice, OpenAiApiClient, GhostWriterConfig } from './openai';
import { AnswerList } from './answer-list';
import { TextAnalysisTextSummarizationApiClient, TwinwordTopicTaggingApiClient } from './rapidapi';

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

  const { width, height } = Dimensions.get('window');

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

    if (writingMode === 'topic_tagging')
    {
      let writer = new TwinwordTopicTaggingApiClient("32adc67923mshf6eaebf96af2bc5p13d6cbjsn67b24e92d24c");
      let json = await writer.generate(text.trim());
  
      if (json.topic) {
        let choices = Object.keys(json.topic).map(t => { return { text: t } as CompletionChoice; });
        setAnswers(choices);
        setAnswersAlert('');
      } else {
        setAnswers([]);
        setAnswersAlert('Ghost Writer could not suggest an answer!');
      }
    }
    else if (writingMode === 'extract')
    {
      let writer = new TextAnalysisTextSummarizationApiClient("32adc67923mshf6eaebf96af2bc5p13d6cbjsn67b24e92d24c");
      let json = await writer.textSummarizerText(text.trim());
  
      if (json.sentences) {
        let choices = json.sentences.map(t => { return { text: t } as CompletionChoice; });
        setAnswers(choices);
        setAnswersAlert('');
      } else {
        setAnswers([]);
        setAnswersAlert('Ghost Writer could not suggest an answer!');
      }
    }
    else
    {
      let writer = new GhostWriterConfig;
      let params = writer.generateCompleteParams(text.trim(), writingMode);
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
    }

    setButtonDisabled(false);
  };

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  }

  if (width > 600)
  {
    // wider screen layout
    return (
      <>
        <View style={{ flexDirection: 'row', flex: 0.7 }}>
          <View style={[styles.gwInputContainer, { flex: 0.5 }]}>
            <TextInput style={styles.gwInput}
                multiline = {true}
                placeholder="Type here!"
                onChangeText={text => setText(text)}></TextInput>
          </View>
          <AnswerList data={answers} answersAlert={answersAlert} style={{ flex: 0.5 }}></AnswerList>
        </View>

        <View style={[styles.settingsContainer, { alignSelf: 'center', width: 500 } ]}>
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
            <Picker.Item label="Summarize" value="summary" />
            <Picker.Item label="Key Sentences" value="extract" />
            <Picker.Item label="Topic Tagging" value="topic_tagging" />
          </Picker>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button}
                disabled={buttonDisabled}
                onPress={createCompletion} >
              <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
              <ActivityIndicator size="small" hidesWhenStopped={true} animating={buttonDisabled} />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }
  else
  {
    // smaller screen layout
    return (
      <>
        <View style={{ flexDirection: 'column', flex: 1 }}>
          <View style={[styles.gwInputContainer, { flex: 0.4 }]}>
            <TextInput style={styles.gwInput}
                multiline = {true}
                placeholder="Type here!"
                onChangeText={text => setText(text)}></TextInput>
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
          <View style={[styles.settingsContainer, { display: settingsVisible ? 'flex' : 'none', marginBottom: 10 }]}>
            <Picker
                selectedValue={writingMode}
                style={styles.modePicker}
                itemStyle={styles.modePickerItemStyle}
                mode='dropdown'
                onValueChange={(itemValue, itemIndex) => setWritingMode(itemValue.toString())}>
              <Picker.Item label="Auto-complete" value="autocomplete" />
              <Picker.Item label="Re-write" value="rewrite" />
              <Picker.Item label="Q&A" value="qa" />
              <Picker.Item label="Summarize" value="summary" />
              <Picker.Item label="Key Sentences" value="extract" />
              <Picker.Item label="Topic Tagging" value="topic_tagging" />
            </Picker>
          </View>
          <AnswerList data={answers} answersAlert={answersAlert} style={{ flex: 0.6 }}></AnswerList>
        </View>
      </>
    );
  }

}

export default GhostWriterSimple;
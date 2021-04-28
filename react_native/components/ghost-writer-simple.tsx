import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import * as Linking from 'expo-linking';

import { styles, mdScreenWidth } from './styles';
import { EngineID, CompletionChoice, OpenAiApiClient, GhostWriterConfig, CompletionParams } from './openai';
import { GhostWriterModeConfig } from './ghost-writer-mode-config';
import { AnswerList } from './answer-list';
import { SmodinRewriterApiClient, SmodinRewriteRequest, TextAnalysisTextSummarizationApiClient, TextAnalysisTextSummarizationTextRequest, TwinwordTopicTaggingApiClient } from './rapidapi';

interface GhostWriterSimpleProps {
  seedText: string,
}

const GhostWriterSimple: FC<GhostWriterSimpleProps> = (props: GhostWriterSimpleProps) => {
  const [writingMode, setWritingMode] = useState('autocomplete');
  const [text, setText] = useState(props.seedText || '');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [noAnswerAlert, setAnswersAlert] = useState('');
  const [answers, setAnswers] = useState([] as CompletionChoice[]);

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

  let autocompleteConfig: CompletionParams;
  let qaConfig: CompletionParams;
  let summaryConfig: CompletionParams;
  let rewriteConfig: CompletionParams;
  let rewriteSmodinConfig: SmodinRewriteRequest;
  let extractConfig: TextAnalysisTextSummarizationTextRequest;

  const onModeConfigChange = (mode: string, config: any) => {
    setWritingMode(mode);

    if (mode === 'topic_tagging')
    {}
    else if (mode === 'extract') {
      extractConfig = config as TextAnalysisTextSummarizationTextRequest;
    } else if (mode === 'rewrite-smodin') {
      rewriteSmodinConfig = config as SmodinRewriteRequest;
    } else {
      if (mode === 'rewrite') {
        rewriteConfig = config as CompletionParams;
      } else if (mode === 'qa') {
        qaConfig = config as CompletionParams;
      } else if (mode === 'summary') {
        summaryConfig = config as CompletionParams;
      } else {
        autocompleteConfig = config as CompletionParams;
      }
    }
  };

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
  
      if (json.keyword) {
        let choices = Object.keys(json.keyword).map(t => { return { text: t } as CompletionChoice; });
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
      let json = await writer.textSummarizerText(text.trim(), extractConfig && extractConfig.sentnum);
  
      if (json.sentences) {
        let choices = json.sentences.map(t => { return { text: t } as CompletionChoice; });
        setAnswers(choices);
        setAnswersAlert('');
      } else {
        setAnswers([]);
        setAnswersAlert('Ghost Writer could not suggest an answer!');
      }
    }
    else if (writingMode === 'rewrite-smodin')
    {
      let writer = new SmodinRewriterApiClient("32adc67923mshf6eaebf96af2bc5p13d6cbjsn67b24e92d24c");
      let json = await writer.rewrite(text.trim(), rewriteSmodinConfig && rewriteSmodinConfig.language, rewriteSmodinConfig && rewriteSmodinConfig.strength);
  
      if (json.rewrite) {
        let choices = [
          { text: json.rewrite } as CompletionChoice,
        ];
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
      let params : CompletionParams;

      if (writingMode === 'rewrite')
        params = writer.generateCompleteParams(text.trim(), rewriteConfig ? '' : 'rewrite', rewriteConfig);
      else if (writingMode === 'qa')
        params = writer.generateCompleteParams(text.trim(), qaConfig ? '' : 'qa', qaConfig);
      else if (writingMode === 'summary')
        params = writer.generateCompleteParams(text.trim(), summaryConfig ? '' : 'summary', summaryConfig);
      else
        params = writer.generateCompleteParams(text.trim(), autocompleteConfig ? '' : 'autocomplete', autocompleteConfig);

      let json = await apiClient.completion(params);
  
      if (json.choices) {
        setAnswers(json.choices.filter(c => (c.text || '').trim().length > 0));
  
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

  if (width > mdScreenWidth)
  {
    // wider screen layout
    return (
      <>
        <GhostWriterModeConfig onModeChange={onModeConfigChange}></GhostWriterModeConfig>

        <View style={{ flexDirection: 'row', flex: 0.7 }}>
          <View style={[styles.gwInputContainer, { flex: 0.5 }]}>
            <TextInput style={styles.gwInput}
                multiline = {true}
                placeholder="Type here!"
                onChangeText={text => setText(text)}></TextInput>
          </View>
          <AnswerList data={answers} noAnswerAlert={noAnswerAlert} style={{ flex: 0.5 }}></AnswerList>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button}
              disabled={buttonDisabled}
              onPress={createCompletion} >
            <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
            <ActivityIndicator size="small" hidesWhenStopped={true} animating={buttonDisabled} />
          </TouchableOpacity>
        </View>
      </>
    );
  }
  else
  {
    // smaller screen layout
    return (
      <>
        <GhostWriterModeConfig onModeChange={onModeConfigChange}></GhostWriterModeConfig>

        <View style={[styles.gwInputContainer, { flex: 0.5 }]}>
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
        </View>
        <AnswerList data={answers} noAnswerAlert={noAnswerAlert} style={{ flex: 0.5 }}></AnswerList>
      </>
    );
  }

}

export default GhostWriterSimple;
import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import * as Linking from 'expo-linking';

import { styles, mdScreenWidth } from './styles';
import {
  EngineID,
  CompletionChoice,
  CompletionRequest,
  ArticleGeneratorRequest,
  ArticleRewriterRequest,
  CompletionResponse,
  GhostWriterFullLayouts,
  ArticleSummarizerRequest,
  ArticleExtractorRequest,
} from '../lib/types';
import { GhostWriterConfig } from '../lib/writer-config';
import { MyApiClient } from '../lib/api-client';
import { AnswerList } from './AnswerList';
import { GhostWriterModeConfig, GhostWriterModes } from './GhostWriterModeConfig';
import { useAppSelector } from '../redux/hooks';

interface GhostWriterFullProps {
  seedText: string,
  layout: GhostWriterFullLayouts,
}

const GhostWriterFull: FC<GhostWriterFullProps> = (props: GhostWriterFullProps) => {
  const [text, setText] = useState(props.seedText || '');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [noAnswerAlert, setAnswersAlert] = useState('');
  const [answers, setAnswers] = useState([] as CompletionChoice[]);

  const writingMode = useAppSelector( state => state.writerModeConfigs.writingMode );
  const autocompleteConfig = useAppSelector( state => state.writerModeConfigs.autocompleteConfig );
  const qaConfig = useAppSelector( state => state.writerModeConfigs.qaConfig );
  const summaryConfig = useAppSelector( state => state.writerModeConfigs.summaryConfig );
  const rewriteConfig = useAppSelector( state => state.writerModeConfigs.rewriteConfig );
  const rewriteSmodinConfig = useAppSelector( state => state.writerModeConfigs.rewriteSmodinConfig );
  const articleGeneratorConfig  = useAppSelector( state => state.writerModeConfigs.articleGeneratorConfig );
  const rewriteFromUrlConfig = useAppSelector( state => state.writerModeConfigs.rewriteFromUrlConfig );
  const extractConfig = useAppSelector( state => state.writerModeConfigs.extractConfig );
  const extractUrlConfig = useAppSelector( state => state.writerModeConfigs.extractUrlConfig );
  const summarizeArticleConfig = useAppSelector( state => state.writerModeConfigs.summarizeArticleConfig );
  const summarizeUrlConfig = useAppSelector( state => state.writerModeConfigs.summarizeUrlConfig );


  const { width, height } = Dimensions.get('window');

  const apiClient = new MyApiClient('84PdwfwpSkak79k1mF1BDjagNwpQvSeWtuTiGVWDwF8JyQlD9oS78d9XddI', EngineID.Curie);

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
    console.log(writingMode, text);

    setButtonDisabled(true);

    try {
      if (writingMode === GhostWriterModes.TOPIC_TAGGING)
      {
        let json = await apiClient.generateTagging(text.trim());
    
        if (json.keyword) {
          let choices = Object.keys(json.keyword).map(t => { return { text: t } as CompletionChoice; });
          setAnswers(choices);
          setAnswersAlert('');
        } else {
          setAnswers([]);
          setAnswersAlert('Ghost Writer could not suggest an answer!');
        }
      }
      else if (writingMode === GhostWriterModes.EXTRACT_KEY_SENTENCES || writingMode === GhostWriterModes.EXTRACT_FROM_URL)
      {
        let params = {} as ArticleExtractorRequest;
        let text1 = text.trim();
        if (writingMode === GhostWriterModes.EXTRACT_KEY_SENTENCES && extractConfig) {
          params.api = extractConfig.api;
          params.num_sentences = extractConfig.num_sentences;
          params.text = text1;
        } else if (writingMode === GhostWriterModes.EXTRACT_FROM_URL && extractUrlConfig) {
          params.api = extractUrlConfig.api;
          params.num_sentences = extractUrlConfig.num_sentences;
          params.url = text1;
        }

        let json = await apiClient.extractArticle(params);
    
        if (json.sentences) {
          let choices = json.sentences.map(t => { return { text: t } as CompletionChoice; });
          setAnswers(choices);
          setAnswersAlert('');
        } else {
          setAnswers([]);
          setAnswersAlert('Ghost Writer could not suggest an answer!');
        }
      }
      else if (writingMode === GhostWriterModes.SUMMARIZE_ARTICLE || writingMode === GhostWriterModes.SUMMARIZE_URL)
      {
        let params = {} as ArticleSummarizerRequest;
        let text1 = text.trim();
        if (writingMode === GhostWriterModes.SUMMARIZE_ARTICLE && summarizeArticleConfig) {
          params.api = summarizeArticleConfig.api;
          params.text = text1;
        } else if (writingMode === GhostWriterModes.SUMMARIZE_URL && summarizeUrlConfig) {
          params.api = summarizeUrlConfig.api;
          params.url = text1;
        }

        let json = await apiClient.summarizeArticle(params);
    
        if (json.summary) {
          let choices = [ { text: json.summary } as CompletionChoice ];
          setAnswers(choices);
          setAnswersAlert('');
        } else {
          setAnswers([]);
          setAnswersAlert('Ghost Writer could not suggest an answer!');
        }
      }
      else if (writingMode === GhostWriterModes.REWRITE_TEXT || writingMode === GhostWriterModes.REWRITE_FROM_URL)
      {
        let params = {} as ArticleRewriterRequest;
        let text1 = text.trim();
        if (writingMode === GhostWriterModes.REWRITE_TEXT && rewriteSmodinConfig) {
          params.language = rewriteSmodinConfig.language;
          params.strength = rewriteSmodinConfig.strength;
          params.rewrite = rewriteSmodinConfig.rewrite;
        } else if (writingMode === GhostWriterModes.REWRITE_FROM_URL && rewriteFromUrlConfig) {
          params.language = rewriteFromUrlConfig.language;
          params.strength = rewriteFromUrlConfig.strength;
          params.rewrite = rewriteFromUrlConfig.rewrite;
        }

        if (writingMode === GhostWriterModes.REWRITE_TEXT) {
          params.text = text1;
        } else if (writingMode === GhostWriterModes.REWRITE_FROM_URL) {
          if (/^(ftp|http|https):\/\/[^ "]+$/.test(text1)) {
            params.url = text1;
          } else {
            setAnswers([
              { text: 'Invalid URL!' } as CompletionChoice,
            ]);
          }
        }

        if (params.url || params.text) {
          let json = await apiClient.rewriteArticle(params);
          if (json.rewrite) {
            setAnswers([
              { text: json.rewrite } as CompletionChoice,
            ]);
            setAnswersAlert('');
          } else {
            setAnswers([
              { text: 'Ghost Writer could not suggest an answer!' } as CompletionChoice,
            ]);
            setAnswersAlert('');
          }
        }
      }
      else if (writingMode === GhostWriterModes.GENERATE_ARTICLE)
      {
        let params = {} as ArticleGeneratorRequest;
        params.seed_text = text.trim();
        params.output_format = articleGeneratorConfig?.output_format || 'text';
        params.num_serp_results = articleGeneratorConfig?.num_serp_results;
        params.num_outbound_links_per_serp_result = articleGeneratorConfig?.num_outbound_links_per_serp_result;
        params.rewrite = articleGeneratorConfig?.rewrite == false ? false : true;

        let json = await apiClient.generateArticle(params);
        if (json.generated_article) {
          setAnswers([
            { text: json.generated_article, html: false } as CompletionChoice,
          ]);
          setAnswersAlert('');
        } else {
          setAnswers([]);
          setAnswersAlert('Ghost Writer could not suggest an answer!');
        }
      }
      else
      {
        let writer = new GhostWriterConfig;
        let params : CompletionRequest;
        let json : CompletionResponse;

        if (writingMode === GhostWriterModes.QA) {
          params = writer.generateCompleteParams(text.trim(), GhostWriterModes.QA, qaConfig);
          json = await apiClient.runQA(params);
        }
        else {
          if (writingMode === GhostWriterModes.REWRITE)
            params = writer.generateCompleteParams(text.trim(), rewriteConfig ? '' : GhostWriterModes.REWRITE, rewriteConfig);
          else if (writingMode === GhostWriterModes.SUMMARY)
            params = writer.generateCompleteParams(text.trim(), summaryConfig ? '' : GhostWriterModes.SUMMARY, summaryConfig);
          else
            params = writer.generateCompleteParams(text.trim(), autocompleteConfig ? '' : GhostWriterModes.AUTOCOMPLETE, autocompleteConfig);

          json = await apiClient.completion(params);
        }
    
        if (json.choices) {
          setAnswers(json.choices.filter(c => (c.text || '').trim().length > 0));
    
          if (writingMode === GhostWriterModes.REWRITE)
            setAnswersAlert('Ghost Writer has' + json.choices.length + (json.choices.length > 1 ? ' suggestions' : ' suggestion') + ' to rewrite above text!');
          else if (writingMode === GhostWriterModes.QA)
            setAnswersAlert('Ghost Writer suggests ' + json.choices.length + (json.choices.length > 1 ? ' answers' : ' answer') + '!');
          else
            setAnswersAlert('Ghost Writer has ' + json.choices.length + (json.choices.length > 1 ? ' suggestions' : ' suggestion') + '!');
        } else {
          setAnswers([]);
          setAnswersAlert('Ghost Writer could not suggest an answer!');
        }
      }
    }
    catch
    {}

    setButtonDisabled(false);
  };

  if (props.layout == GhostWriterFullLayouts.simple)
  {
    if (width > mdScreenWidth)
    {
      // wider screen layout
      return (
        <>
          <GhostWriterModeConfig layout={props.layout}></GhostWriterModeConfig>

          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
            <View style={[styles.gwInputContainer, { flex: 0.49 }]}>
              <TextInput style={styles.gwInput}
                  multiline = {true}
                  placeholder="Type here!"
                  onChangeText={text => setText(text)}></TextInput>
            </View>
            <AnswerList data={answers} noAnswerAlert={noAnswerAlert} style={{ flex: 0.49 }} placeholder={''}></AnswerList>
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
          <GhostWriterModeConfig layout={props.layout}></GhostWriterModeConfig>

          <View style={[styles.gwInputContainer, { flex: 0.45 }]}>
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
  else
  {
    return (
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{ flexDirection: 'column', flex: 0.75, alignItems: 'stretch', justifyContent: 'flex-start' }}>
          <View style={[styles.gwInputContainer, { flex: 0.5 }]}>
            <TextInput style={styles.gwInput}
                multiline = {true}
                placeholder="Type here!"
                onChangeText={text => setText(text)}></TextInput>
          </View>
          <AnswerList data={answers} noAnswerAlert={noAnswerAlert} style={{ flex: 0.5 }}></AnswerList>
        </View>

        <View style={{ flexDirection: 'column', flex:0.25 }}>
          <GhostWriterModeConfig layout={props.layout} style={{flex: 1, overflow: 'hidden'}}></GhostWriterModeConfig>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button}
                disabled={buttonDisabled}
                onPress={createCompletion} >
              <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
              <ActivityIndicator size="small" hidesWhenStopped={true} animating={buttonDisabled} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

}

export default GhostWriterFull;
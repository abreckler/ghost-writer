import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import * as Linking from 'expo-linking';

import { styles, mdScreenWidth } from './styles';
import {
  EngineID,
  CompletionChoice,
  CompletionParams,
  TextAnalysisTextSummarizationTextRequest,
  ArticleGeneratorRequest,
  ArticleRewriterRequest,
} from './lib/types';
import { GhostWriterConfig } from './lib/writer-config';
import { MyApiClient } from './lib/api-client';
import { GhostWriterModeConfig, GhostWriterModes } from './ghost-writer-mode-config';
import { AnswerList } from './answer-list';

interface GhostWriterSimpleProps {
  seedText: string,
}

const GhostWriterSimple: FC<GhostWriterSimpleProps> = (props: GhostWriterSimpleProps) => {
  const [writingMode, setWritingMode] = useState('autocomplete');
  const [text, setText] = useState(props.seedText || '');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [noAnswerAlert, setAnswersAlert] = useState('');
  const [answers, setAnswers] = useState([] as CompletionChoice[]);

  const [autocompleteConfig, setAutocompleteConfig] = useState(undefined as CompletionParams | undefined);
  const [qaConfig, setQaConfig] = useState(undefined as CompletionParams | undefined);
  const [summaryConfig, setSummaryConfig] = useState(undefined as CompletionParams | undefined);
  const [rewriteConfig, setRewriteConfig] = useState(undefined as CompletionParams | undefined);
  const [rewriteSmodinConfig, setRewriteSmodinConfig] = useState(undefined as ArticleRewriterRequest | undefined);
  const [extractConfig, setExtractConfig] = useState(undefined as TextAnalysisTextSummarizationTextRequest | undefined);
  const [generateArticleConfig, setGenerateArticleConfig] = useState(undefined as ArticleGeneratorRequest | undefined);
  const [rewriteFromUrlConfig, setRewriteFromUrlConfig] = useState(undefined as ArticleRewriterRequest | undefined);

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


  const onModeConfigChange = (mode: string, config: any) => {
    console.log('onModeConfigChange', mode, config);
    if (mode === GhostWriterModes.TOPIC_TAGGING)
    {}
    else if (mode === GhostWriterModes.EXTRACT) {
      setExtractConfig(config as TextAnalysisTextSummarizationTextRequest);
    } else if (mode === GhostWriterModes.REWRITE_TEXT) {
      setRewriteSmodinConfig(config as ArticleRewriterRequest);
    } else if (mode === GhostWriterModes.REWRITE_FROM_URL) {
      setRewriteFromUrlConfig(config as ArticleRewriterRequest);
    } else if(mode === GhostWriterModes.GENERATE_ARTICLE) {
      setGenerateArticleConfig(config as ArticleGeneratorRequest);
    } else {
      if (mode === GhostWriterModes.REWRITE) {
        setRewriteConfig(config as CompletionParams);
      } else if (mode === GhostWriterModes.QA) {
        setQaConfig(config as CompletionParams);
      } else if (mode === GhostWriterModes.SUMMARY) {
        setSummaryConfig(config as CompletionParams);
      } else {
        setAutocompleteConfig(config as CompletionParams);
      }
    }

    setWritingMode(mode);
  };

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
      else if (writingMode === GhostWriterModes.EXTRACT)
      {
        let json = await apiClient.textSummarizerText(text.trim(), extractConfig && extractConfig.sentnum);
    
        if (json.sentences) {
          let choices = json.sentences.map(t => { return { text: t } as CompletionChoice; });
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
        params.output_format = generateArticleConfig?.output_format || 'text';
        params.num_serp_results = generateArticleConfig?.num_serp_results;
        params.num_outbound_links_per_serp_result = generateArticleConfig?.num_outbound_links_per_serp_result;
        params.rewrite = generateArticleConfig?.rewrite == false ? false : true;

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
        let params : CompletionParams;

        if (writingMode === GhostWriterModes.REWRITE)
          params = writer.generateCompleteParams(text.trim(), rewriteConfig ? '' : GhostWriterModes.REWRITE, rewriteConfig);
        else if (writingMode === GhostWriterModes.QA)
          params = writer.generateCompleteParams(text.trim(), qaConfig ? '' : GhostWriterModes.QA, qaConfig);
        else if (writingMode === GhostWriterModes.SUMMARY)
          params = writer.generateCompleteParams(text.trim(), summaryConfig ? '' : GhostWriterModes.SUMMARY, summaryConfig);
        else
          params = writer.generateCompleteParams(text.trim(), autocompleteConfig ? '' : 'autocomplete', autocompleteConfig);

        let json = await apiClient.completion(params);
    
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

  if (width > mdScreenWidth)
  {
    // wider screen layout
    return (
      <>
        <GhostWriterModeConfig onModeChange={onModeConfigChange}></GhostWriterModeConfig>

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
        <GhostWriterModeConfig onModeChange={onModeConfigChange}></GhostWriterModeConfig>

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

export default GhostWriterSimple;
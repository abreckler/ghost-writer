import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import styles from './styles';
import { CompletionParams } from './openai';
import { SmodinRewriteRequest, TextAnalysisTextSummarizationTextRequest } from './rapidapi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TagsInput } from './tags-input';

//-------------------------------------
// OpenAI Completion API
//-------------------------------------
interface OpenAiAutocompleteConfigProps {
  value: CompletionParams;
  onValueChange(value: CompletionParams) : void;
  style: ViewStyle;
}

const OpenAiAutocompleteConfig: FC<OpenAiAutocompleteConfigProps> = (props: OpenAiAutocompleteConfigProps) => {
  const [n, _setN] = useState(props.value?.n || 1);
  const [prompt, _setPrompt] = useState(props.value?.prompt);
  const [max_tokens, setMaxTokens] = useState(props.value?.max_tokens);
  const [temperature, _setTemperature] = useState(props.value?.temperature);
  const [top_p, _setTopP] = useState(props.value?.top_p);
  const [logprobs, setLogprobs] = useState(props.value?.logprobs);
  const [echo, setEcho] = useState(props.value?.echo);
  const [stop, _setStop] = useState(props.value?.stop || ['.']);
  const [presence_penalty, _setPresencePenalty] = useState(props.value?.presence_penalty || 0);
  const [frequency_penalty, _setFrequencyPenalty] = useState(props.value?.frequency_penalty || 0);
  const [best_of, setBestOf] = useState(props.value?.best_of || 1);

  const setN = (_value: string) => {
    let value = Number.parseInt(_value);
    value = Number.isNaN(value) ? 0 : (value <= 0 ? 0 : value);
    _setN(Number.parseInt(_value));
    onValueChange();
  }
  const setPrompt = (_value: string) => {
    if (!_value.indexOf('{USER_INPUT}'))
    {
      Alert.alert("Autocomplete prompt template must contain {USER_INPUT} variable.");
    }
    else {
      _setPrompt(_value);
      onValueChange();
    }
  }
  const setTemperature = (_value: string) => {
    let value = Number.parseFloat(_value);
    value = Number.isNaN(value) ? 0 : (value < 0 ? 0 : (value > 1.0 ? 1.0 : value));
    _setTemperature(value);
    onValueChange();
  }
  const setTopP = (_value: string) => {
    let value = Number.parseFloat(_value);
    value = Number.isNaN(value) ? 0 : (value < 0 ? 0 : (value > 1.0 ? 1.0 : value));
    _setTopP(value);
    onValueChange();
  }
  const setPresencePenalty = (_value: string) => {
    let value = Number.parseFloat(_value);
    value = Number.isNaN(value) ? 0 : (value < 0 ? 0 : (value > 1.0 ? 1.0 : value));
    _setPresencePenalty(value);
    onValueChange();
  }
  const setFrequencyPenalty = (_value: string) => {
    let value = Number.parseFloat(_value);
    value = Number.isNaN(value) ? 0 : (value < 0 ? 0 : (value > 1.0 ? 1.0 : value));
    _setFrequencyPenalty(value);
    onValueChange();
  }

  const setStop = (_value: Array<string>) => {
    _setStop(_value);
    onValueChange();
  }

  const onValueChange = () => {
    if (props.onValueChange)
      props.onValueChange({
        n: n,
        prompt: prompt,
        temperature: temperature,
        top_p: top_p,
        presence_penalty: presence_penalty,
        frequency_penalty: frequency_penalty,
      } as CompletionParams);
  }

  return (
    <View style={props.style}>
      <Text style={styles.label}>Prompt</Text>
      <TextInput style={[styles.input]}
          value={prompt} onChangeText={setPrompt} >
      </TextInput>
      <Text style={styles.label}>Number of answers to generate</Text>
      <TextInput style={[styles.input]}
          value={n?.toString()} onChangeText={setN} >
      </TextInput>
      <Text style={styles.label}>Sampling Temperature</Text>
      <TextInput style={[styles.input]}
          value={temperature?.toString()} onChangeText={setTemperature} >
      </TextInput>
      <Text style={styles.label}>Nucleus Sampling Temperature</Text>
      <TextInput style={[styles.input]}
          value={top_p?.toString()} onChangeText={setTopP} >
      </TextInput>
      <TagsInput initialTags={stop} initialText={""} maxNumberOfTags={4} onChangeTags={setStop}></TagsInput>
    </View>
  );
}


//-----------------------------------------
// Text Summarization API of TextAnalysis
//-----------------------------------------
interface TextAnalysisTextSummarizationConfigProps {
  value: TextAnalysisTextSummarizationTextRequest,
  onValueChange(value: TextAnalysisTextSummarizationTextRequest) : void;
  style: ViewStyle;
}

const TextAnalysisTextSummarizationConfig: FC<TextAnalysisTextSummarizationConfigProps> = (props: TextAnalysisTextSummarizationConfigProps) => {
  const [sentnum, setSentnum] = useState(props.value?.sentnum || 5);

  const onValueChange = () => {
    if (props.onValueChange)
      props.onValueChange({ sentnum: sentnum } as TextAnalysisTextSummarizationTextRequest);
  }

  return (
    <View style={props.style}>
      <Text>Number of answers to generate</Text>
      <TextInput style={[styles.input]} placeholder="Type here!"
          value={sentnum?.toString()} onChangeText={(v) => { setSentnum(Number.parseInt(v)); onValueChange(); }} >
      </TextInput>
    </View>
  );
}

//-----------------------------------------
// Rewrite API of Somdin
//-----------------------------------------
interface SmodinRewriteConfigProps {
  value: SmodinRewriteRequest,
  onValueChange(value: SmodinRewriteRequest) : void;
  style: ViewStyle;
}

const SmodinRewriteConfig: FC<SmodinRewriteConfigProps> = (props: SmodinRewriteConfigProps) => {
  const [language, setLanguage] = useState(props.value?.language || 'en');
  const [strength, setStrength] = useState(props.value?.strength || 3);

  const onValueChange = () => {
    if (props.onValueChange)
      props.onValueChange({ language: language, strength: strength } as SmodinRewriteRequest);
  }

  return (
    <View style={props.style}>
      <Text>Language</Text> 
      <Picker
          selectedValue={language}
          style={[styles.picker]}
          itemStyle={styles.pickerItemStyle}
          mode='dropdown'
          onValueChange={(v) => { setLanguage(v); onValueChange(); }}>
        <Picker.Item label="English" value="en" />
        <Picker.Item label="German" value="de" />
        <Picker.Item label="Spanish" value="es" />
        <Picker.Item label="French" value="fr" />
        <Picker.Item label="Arabic" value="ar" />
        <Picker.Item label="Chinese" value="zh" />
      </Picker>
      <Text>Strength</Text>
      <Picker
          selectedValue={strength.toString()}
          style={[styles.picker]}
          itemStyle={styles.pickerItemStyle}
          mode='dropdown'
          onValueChange={(v) => { setStrength(Number.parseInt(v)); onValueChange(); }}>
        <Picker.Item label="Strong" value="3" />
        <Picker.Item label="Medium" value="2" />
        <Picker.Item label="Basic" value="1" />
      </Picker>
    </View>
  );
}


//-----------------------------------------
// Ghost Writer Mode config component
//-----------------------------------------
interface GhostWriterModeConfigProps {
  mode?: string;
  onModeChange(mode: string, modeConfig: any) : void;
}

const GhostWriterModeConfig: FC<GhostWriterModeConfigProps> = (props: GhostWriterModeConfigProps) => {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [writingMode, _setWritingMode] = useState(props.mode || 'autocomplete');
  const [autocompleteConfig, _setAutocompleteConfig] = useState({} as CompletionParams);
  const [qaConfig, _setQaConfig] = useState({} as CompletionParams);
  const [summaryConfig, _setSummaryConfig] = useState({} as CompletionParams);
  const [rewriteConfig, _setRewriteConfig] = useState({} as CompletionParams);
  const [rewriteSmodinConfig, _setRewriteSmodinConfig] = useState({} as SmodinRewriteRequest);
  const [extractConfig, _setExtractConfig] = useState({} as TextAnalysisTextSummarizationTextRequest);

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  };

  //
  // Read/Write to/from Store
  //
  const storeData = async () => {
    try {
      const multiSet = [
        ['@gw__writing_mode', writingMode],
        ['@gw__mode_config__autocomplete', JSON.stringify(autocompleteConfig)],
        ['@gw__mode_config__qa', JSON.stringify(qaConfig)],
        ['@gw__mode_config__summary', JSON.stringify(summaryConfig)],
        ['@gw__mode_config__rewrite', JSON.stringify(rewriteConfig)],
        ['@gw__mode_config__rewrite_smodin', JSON.stringify(rewriteSmodinConfig)],
        ['@gw__mode_config__extract', JSON.stringify(extractConfig)],
      ]
      await AsyncStorage.multiSet(multiSet);
    } catch (e) {
      // saving error
      console.log('GW mode configurator - Writing Error', e);
    }
  };
  const readFromData = async () => {
    try {
      const multiGet = await AsyncStorage.multiGet([
        '@gw__writing_mode',
        '@gw__mode_config__autocomplete',
        '@gw__mode_config__qa',
        '@gw__mode_config__summary',
        '@gw__mode_config__rewrite',
        '@gw__mode_config__rewrite_smodin',
        '@gw__mode_config__extract',
      ]);

      _setWritingMode(multiGet[0][1] || 'autocomplete');
      _setAutocompleteConfig((multiGet[1][1] ? JSON.parse(multiGet[1][1]) : {}) as CompletionParams);
      _setQaConfig((multiGet[2][1] ? JSON.parse(multiGet[2][1]) : {}) as CompletionParams);
      _setSummaryConfig((multiGet[3][1] ? JSON.parse(multiGet[3][1]) : {}) as CompletionParams);
      _setRewriteConfig((multiGet[4][1] ? JSON.parse(multiGet[4][1]) : {}) as CompletionParams);
      _setRewriteSmodinConfig((multiGet[5][1] ? JSON.parse(multiGet[5][1]) : {}) as SmodinRewriteRequest);
      _setExtractConfig((multiGet[6][1] ? JSON.parse(multiGet[6][1]) : {}) as TextAnalysisTextSummarizationTextRequest);
    } catch (e) {
      // reading error
      console.log('GW mode configurator - Reading Error', e);
    }

    onModePickerChange();
  };
  const onModePickerChange = () => {
    storeData();

    if (props.onModeChange) {
      if (writingMode === 'autocomplete')
        props.onModeChange('autocomplete', autocompleteConfig);
      else if (writingMode === 'rewrite')
        props.onModeChange('rewrite', rewriteConfig);
      else if (writingMode === 'qa')
        props.onModeChange('qa', qaConfig);
      else if (writingMode === 'summary')
        props.onModeChange('summary', summaryConfig);
      else if (writingMode === 'extract')
        props.onModeChange('extract', extractConfig);
      else if (writingMode === 'topic_tagging')
        props.onModeChange('topic_tagging', null);
      else if (writingMode === 'rewrite-smodin')
        props.onModeChange('rewrite-smodin', rewriteSmodinConfig);
    };
  };

  //
  // State setter overrides
  //
  const setWritingMode = (_value: string, _idx: number) => {
    _setWritingMode(_value);
    onModePickerChange();
  };
  const setAutocompleteConfig = (_value: CompletionParams) => {
    _setAutocompleteConfig(_value);
    onModePickerChange();
  };
  const setQaConfig = (_value: CompletionParams) => {
    _setQaConfig(_value);
    onModePickerChange();
  };
  const setSummaryConfig = (_value: CompletionParams) => {
    _setSummaryConfig(_value);
    onModePickerChange();
  };
  const setRewriteConfig = (_value: CompletionParams) => {
    _setRewriteConfig(_value);
    onModePickerChange();
  };
  const setRewriteSmodinConfig = (_value: SmodinRewriteRequest) => {
    _setRewriteSmodinConfig(_value);
    onModePickerChange();
  };
  const setExtractConfig = (_value: TextAnalysisTextSummarizationTextRequest) => {
    _setExtractConfig(_value);
    onModePickerChange();
  };

  //
  // Initialize
  //
  readFromData();

  //
  // View
  //
  return (
    <View style={[styles.settingsContainer, { alignSelf: 'flex-start', marginTop: 10, marginBottom: 10 } ]}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.label]}>Mode: </Text>
        <View style={{display: 'flex', flex: 1}}>
          <Picker style={[styles.modePicker]} itemStyle={styles.modePickerItemStyle}
              selectedValue={writingMode}
              onValueChange={setWritingMode}
              mode='dropdown' >
            <Picker.Item label="Auto-complete" value="autocomplete" />
            <Picker.Item label="Re-write (1st person)" value="rewrite" />
            <Picker.Item label="Q&A" value="qa" />
            <Picker.Item label="Summarize" value="summary" />
            <Picker.Item label="Key Sentences" value="extract" />
            <Picker.Item label="Topic Tagging" value="topic_tagging" />
            <Picker.Item label="Re-write" value="rewrite-smodin" />
          </Picker>
        </View>
        <TouchableOpacity style={[styles.button, styles.buttonSm, { marginVertical: 0, marginHorizontal: 10 }]} onPress={toggleSettingsView} >
          <Text style={[styles.buttonText, styles.buttonSmText]}>{ settingsVisible ? 'Hide' : 'Show' } Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={{ display: settingsVisible ? 'flex':'none', paddingVertical: 10 }}>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'autocomplete' ? 'flex' : 'none'}}
            value={autocompleteConfig}
            onValueChange={setAutocompleteConfig}>
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'rewrite' ? 'flex' : 'none'}}
            value={rewriteConfig}
            onValueChange={setRewriteConfig} >
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'qa' ? 'flex' : 'none'}}
            value={qaConfig}
            onValueChange={setQaConfig} >
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'summary' ? 'flex' : 'none'}}
            value={summaryConfig}
            onValueChange={setSummaryConfig} >
        </OpenAiAutocompleteConfig>
        <TextAnalysisTextSummarizationConfig style={{ display: writingMode === 'extract' ? 'flex' : 'none'}}
            value={extractConfig}
            onValueChange={setExtractConfig} >
        </TextAnalysisTextSummarizationConfig>
        <SmodinRewriteConfig style={{ display: writingMode === 'rewrite-smodin' ? 'flex' : 'none'}}
            value={rewriteSmodinConfig}
            onValueChange={setRewriteSmodinConfig} >
        </SmodinRewriteConfig>
        <View style={{ display: writingMode === 'topic_tagging' ? 'flex' : 'none'}}>
          <Text>No additional settings are available</Text>  
        </View>
      </View>
    </View>
  );
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig };
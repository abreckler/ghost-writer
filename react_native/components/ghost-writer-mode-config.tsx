import React, { FC, useState, useEffect } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import styles from './styles';
import { CompletionParams } from './openai';
import { SmodinRewriteRequest, TextAnalysisTextSummarizationTextRequest } from './rapidapi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TagsInput } from './tags-input';

interface InputValidity {
  value: string;
  error: string;
}
interface ValidatorPresetOptions {
  fieldName?: string;
  min?: number;
  max?: number;
  intVal?: boolean;
}
interface TextInputWithValidityCheckProps {
  label: string;
  multiline?: boolean;
  numberOfLines?: number;
  initValue?: string;
  checkValidity? (value: string) : InputValidity;
  onValueChange? (value: string) : void;
  validatorPreset? : 'number';
  validatorPresetOptions? : ValidatorPresetOptions;
}

const TextInputGroupWithValidityCheck: FC<TextInputWithValidityCheckProps> = (props: TextInputWithValidityCheckProps) => {
  const [text, _setText] = useState(props.initValue || '');
  const [error, setError] = useState('');

  const dummyValidityChecker = (value: string) => {
    return {
      value: value,
      error: ''
    } as InputValidity;
  }

  const numberValidityChecker = (value : string) => {
    let fieldName = (props.validatorPresetOptions && (props.validatorPresetOptions.fieldName || 'This')) || 'This';
    let intVal = (props.validatorPresetOptions && (props.validatorPresetOptions.intVal || false)) || false;
    let min = (props.validatorPresetOptions && props.validatorPresetOptions.min) || undefined;
    let max = (props.validatorPresetOptions && props.validatorPresetOptions.min) || undefined;

    let v = intVal ? Number.parseInt(value) : Number.parseFloat(value);
    let error = '';
    if (Number.isNaN(v))
    {
      error = `${fieldName} must be a number`;
    }
    else if ((typeof min !== 'undefined' && min !== null && v < min) || (typeof max !== 'undefined' && max !== null && v > max))
    {
      if (typeof min !== 'undefined' && min !== null && typeof max !== 'undefined' && max !== null) { // both min and max are defined
        error = `${fieldName} must be in the range of ${min} ~ ${max}.`;
      } else if (typeof min !== 'undefined' && min !== null) { // only min is defined
        error = `${fieldName} must be greater than or equal to ${min}.`;
      } else if (typeof max !== 'undefined' && max !== null) { // only max is defined
        error = `${fieldName} must be less than or equal to ${max}.`;
      }
    }
    return {
      value: error ? '' : v.toString(),
      error: error
    } as InputValidity
  };

  var validityChecker = dummyValidityChecker;

  useEffect(() => {
    // update validity checker
    if (props.checkValidity) {
      validityChecker = props.checkValidity;
    } else if (props.validatorPreset === 'number') {
      validityChecker = numberValidityChecker;
    } else {
      validityChecker = dummyValidityChecker;
    }
  });

  const setText = (value: string) => {
    _setText(value);
    let valid = validityChecker(value);

    if (valid && !valid.error) {
      props.onValueChange && props.onValueChange(value);
      setError('');
    } else {
      setError( (valid && valid.error) || 'Your input is invalid' );
    }
  }

  return (
    <>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
          multiline={props.multiline || false} numberOfLines={props.numberOfLines || 1}
          style={[styles.input]}
          defaultValue={text}
          onChange={ e => setText(e.nativeEvent.text) } >
      </TextInput>
      <Text style={[styles.textSmall, styles.textError, { display: error ? 'flex' : 'none' }]}>{error}</Text>
    </>
  );
}

//-------------------------------------
// OpenAI Completion API
//-------------------------------------
interface OpenAiAutocompleteConfigProps {
  initValue: CompletionParams;
  onValueChange(value: CompletionParams) : void;
  style: ViewStyle;
}

const OpenAiAutocompleteConfig: FC<OpenAiAutocompleteConfigProps> = (props: OpenAiAutocompleteConfigProps) => {
  const [prompt, setPrompt] = useState(props.initValue?.prompt);
  const [n, setN] = useState(props.initValue?.n || 1);
  const [max_tokens, setMaxTokens] = useState(props.initValue?.max_tokens);
  const [temperature, setTemperature] = useState(props.initValue?.temperature);
  const [top_p, setTopP] = useState(props.initValue?.top_p);
  const [logprobs, setLogprobs] = useState(props.initValue?.logprobs);
  const [echo, setEcho] = useState(props.initValue?.echo);
  const [stop, setStop] = useState((props.initValue?.stop || []).map(s => s.replaceAll('\n', '\\n').replaceAll('\t', '\\t')));
  const [presence_penalty, setPresencePenalty] = useState(props.initValue?.presence_penalty || 0);
  const [frequency_penalty, setFrequencyPenalty] = useState(props.initValue?.frequency_penalty || 0);
  const [best_of, setBestOf] = useState(props.initValue?.best_of || 1);

  const onValueChange = () => {
    props.onValueChange &&
      props.onValueChange({
        n: n,
        prompt: prompt,
        temperature: temperature,
        top_p: top_p,
        presence_penalty: presence_penalty,
        frequency_penalty: frequency_penalty,
        stop: stop.map(s => s.replaceAll('\\n', '\n').replaceAll('\\t', '\t'))
      } as CompletionParams);
  }

  return (
    <View style={props.style}>
      <TextInputGroupWithValidityCheck label={'Prompt'} initValue={prompt} multiline={true} numberOfLines={5}
          checkValidity={
            (v) => {
              let valid = (v || '').indexOf('{USER_INPUT}') >= 0;
              let error = valid ? '' : 'Prompt must contain {USER_INPUT} placeholder.';
              return {
                value: error ? '' : v,
                error: error
              } as InputValidity
            }
          }
          onValueChange={ v => { setPrompt(v); onValueChange(); } } />

      <TextInputGroupWithValidityCheck label={'Number of answers to generate'} initValue={n?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setN(Number.parseInt(v)); onValueChange(); } } />

      <TextInputGroupWithValidityCheck label={'Sampling Temperature'} initValue={temperature?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setTemperature(Number.parseFloat(v)); onValueChange(); } } />

      <TextInputGroupWithValidityCheck label={'Nucleus Sampling Temperature'} initValue={top_p?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Nucleus Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setTopP(Number.parseFloat(v)); onValueChange(); } } />

      <Text style={styles.label}>Stop Sequence</Text>
      <TagsInput initialTags={stop} initialText={""} maxNumberOfTags={4} onChangeTags={setStop}></TagsInput>

      <TextInputGroupWithValidityCheck label={'Presence Penalty'} initValue={presence_penalty?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Presence Penalty', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setPresencePenalty(Number.parseFloat(v)); onValueChange(); } } />

      <TextInputGroupWithValidityCheck label={'Frequency Penalty'} initValue={frequency_penalty?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Frequency Penalty', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setFrequencyPenalty(Number.parseFloat(v)); onValueChange(); } } />
    </View>
  );
}


//-----------------------------------------
// Text Summarization API of TextAnalysis
//-----------------------------------------
interface TextAnalysisTextSummarizationConfigProps {
  initValue: TextAnalysisTextSummarizationTextRequest,
  onValueChange(value: TextAnalysisTextSummarizationTextRequest) : void;
  style: ViewStyle;
}

const TextAnalysisTextSummarizationConfig: FC<TextAnalysisTextSummarizationConfigProps> = (props: TextAnalysisTextSummarizationConfigProps) => {
  const [sentnum, setSentnum] = useState(props.initValue?.sentnum || 5);

  const onValueChange = () => {
    props.onValueChange &&
      props.onValueChange({ sentnum: sentnum } as TextAnalysisTextSummarizationTextRequest);
  }

  return (
    <View style={props.style}>
      <TextInputGroupWithValidityCheck label={'Number of answers to generate'} initValue={sentnum?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setSentnum(Number.parseInt(v)); onValueChange(); } } />
    </View>
  );
}

//-----------------------------------------
// Rewrite API of Somdin
//-----------------------------------------
interface SmodinRewriteConfigProps {
  initValue: SmodinRewriteRequest,
  onValueChange(value: SmodinRewriteRequest) : void;
  style: ViewStyle;
}

const SmodinRewriteConfig: FC<SmodinRewriteConfigProps> = (props: SmodinRewriteConfigProps) => {
  const [language, setLanguage] = useState(props.initValue?.language || 'en');
  const [strength, setStrength] = useState(props.initValue?.strength || 3);

  const onValueChange = () => {
    props.onValueChange &&
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
          onValueChange={v => { setLanguage(v); onValueChange(); } }>
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
          onValueChange={ v => { setStrength(Number.parseInt(v)); onValueChange(); }}>
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

  const [writingMode, setWritingMode] = useState(props.mode || 'autocomplete');
  const [autocompleteConfig, setAutocompleteConfig] = useState({} as CompletionParams);
  const [qaConfig, setQaConfig] = useState({} as CompletionParams);
  const [summaryConfig, setSummaryConfig] = useState({} as CompletionParams);
  const [rewriteConfig, setRewriteConfig] = useState({} as CompletionParams);
  const [rewriteSmodinConfig, setRewriteSmodinConfig] = useState({} as SmodinRewriteRequest);
  const [extractConfig, setExtractConfig] = useState({} as TextAnalysisTextSummarizationTextRequest);

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

      console.log("Stored Data", multiSet);
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

      console.log("Read from Data", multiGet);

      setWritingMode(multiGet[0][1] || 'autocomplete');
      setAutocompleteConfig((multiGet[1][1] ? JSON.parse(multiGet[1][1]) : {}) as CompletionParams);
      setQaConfig((multiGet[2][1] ? JSON.parse(multiGet[2][1]) : {}) as CompletionParams);
      setSummaryConfig((multiGet[3][1] ? JSON.parse(multiGet[3][1]) : {}) as CompletionParams);
      setRewriteConfig((multiGet[4][1] ? JSON.parse(multiGet[4][1]) : {}) as CompletionParams);
      setRewriteSmodinConfig((multiGet[5][1] ? JSON.parse(multiGet[5][1]) : {}) as SmodinRewriteRequest);
      setExtractConfig((multiGet[6][1] ? JSON.parse(multiGet[6][1]) : {}) as TextAnalysisTextSummarizationTextRequest);

      console.log('autocomplete config', (multiGet[1][1] ? JSON.parse(multiGet[1][1]) : {}) as CompletionParams, autocompleteConfig);
    } catch (e) {
      // reading error
      console.log('GW mode configurator - Reading Error', e);
    }

    onModePickerChange(false);
  };
  const onModePickerChange = (updateStore=true) => {
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

    if (updateStore)
      storeData();
  };

  //
  // Initialize
  //
  useEffect(() => {
    readFromData();
  }, []);

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
            initValue={autocompleteConfig}
            onValueChange={v => {setAutocompleteConfig(v); onModePickerChange(); }} />
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'rewrite' ? 'flex' : 'none'}}
            initValue={rewriteConfig}
            onValueChange={v => {setRewriteConfig(v); onModePickerChange(); }} />
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'qa' ? 'flex' : 'none'}}
            initValue={qaConfig}
            onValueChange={v => {setQaConfig(v); onModePickerChange(); }}  />
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'summary' ? 'flex' : 'none'}}
            initValue={summaryConfig}
            onValueChange={v => {setSummaryConfig(v); onModePickerChange(); }} />
        <TextAnalysisTextSummarizationConfig style={{ display: writingMode === 'extract' ? 'flex' : 'none'}}
            initValue={extractConfig}
            onValueChange={v => {setExtractConfig(v); onModePickerChange(); }} />
        <SmodinRewriteConfig style={{ display: writingMode === 'rewrite-smodin' ? 'flex' : 'none'}}
            initValue={rewriteSmodinConfig}
            onValueChange={v => {setRewriteSmodinConfig(v); onModePickerChange(); }} />
        <View style={{ display: writingMode === 'topic_tagging' ? 'flex' : 'none'}}>
          <Text>No additional settings are available</Text>  
        </View>
      </View>
    </View>
  );
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig };
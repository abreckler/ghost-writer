import React, { FC, useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import styles from './styles';
import { CompletionParams } from './openai';
import { SmodinRewriteRequest, TextAnalysisTextSummarizationTextRequest } from './rapidapi';


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

  const setN = (_value: string) => {
    const v = Number.parseInt(_value);
    _setN(v);
    onValueChange();
  }

  const onValueChange = () => {
    if (props.onValueChange)
      props.onValueChange({ n: n } as CompletionParams);
  }

  return (
    <View style={props.style}>
      <Text>Number of answers to generate</Text>
      <TextInput style={[styles.input]}
          value={n?.toString()} onChangeText={ t => { setN(t), onValueChange() } } >
      </TextInput>
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
  const [sentnum, _setSentnum] = useState(props.value?.sentnum || 5);

  const setSentnum = (_value: string) => {
    _setSentnum(Number.parseInt(_value));
    onValueChange();
  }

  const onValueChange = () => {
    if (props.onValueChange)
      props.onValueChange({ sentnum: sentnum } as TextAnalysisTextSummarizationTextRequest);
  }

  return (
    <View style={props.style}>
      <Text>Number of answers to generate</Text>
      <TextInput style={[styles.input]} placeholder="Type here!"
          value={sentnum?.toString()} onChangeText={ t => setSentnum(t) } >
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
  const [language, _setLanguage] = useState(props.value?.language || 'en');
  const [strength, _setStrength] = useState(props.value?.strength || 3);

  const setLanguage = (_value: string) => {
    _setLanguage(_value);
    onValueChange();
  }
  const setStrength = (_value: string) => {
    _setStrength(Number.parseInt(_value));
    onValueChange();
  }
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
          onValueChange={setLanguage}>
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
          onValueChange={setStrength}>
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
  const [writingMode, setWritingMode] = useState(props.mode || 'autocomplete');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const [autocompleteConfig, setAutocompleteConfig] = useState({} as CompletionParams);
  const [qaConfig, setQaConfig] = useState({} as CompletionParams);
  const [summaryConfig, setSummaryConfig] = useState({} as CompletionParams);
  const [rewriteConfig, setRewriteConfigConfig] = useState({} as CompletionParams);
  const [rewriteSmodinConfig, setRewriteSmodinConfig] = useState({} as SmodinRewriteRequest);
  const [extractConfig, setExtractConfig] = useState({} as TextAnalysisTextSummarizationTextRequest);

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  }

  const onModePickerChange = (value: string, idx: number) => {
    setWritingMode(value);
    props.onModeChange && props.onModeChange(writingMode, null);
  }

  return (
    <View style={[styles.settingsContainer, { alignSelf: 'flex-start', marginTop: 10, marginBottom: 10 } ]}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[styles.label]}>Mode: </Text>
        <View style={{display: 'flex', flex: 1}}>
          <Picker
              selectedValue={writingMode}
              style={[styles.modePicker]}
              itemStyle={styles.modePickerItemStyle}
              mode='dropdown'
              onValueChange={onModePickerChange}>
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
            value={autocompleteConfig} onValueChange={setAutocompleteConfig}>
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'rewrite' ? 'flex' : 'none'}}
            value={rewriteConfig} onValueChange={setRewriteConfigConfig}>
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'qa' ? 'flex' : 'none'}}
            value={qaConfig} onValueChange={setQaConfig}>
        </OpenAiAutocompleteConfig>
        <OpenAiAutocompleteConfig style={{ display: writingMode === 'summary' ? 'flex' : 'none'}}
            value={summaryConfig} onValueChange={setSummaryConfig}>
        </OpenAiAutocompleteConfig>
        <TextAnalysisTextSummarizationConfig style={{ display: writingMode === 'extract' ? 'flex' : 'none'}}
            value={extractConfig} onValueChange={setExtractConfig}>
        </TextAnalysisTextSummarizationConfig>
        <SmodinRewriteConfig style={{ display: writingMode === 'rewrite-smodin' ? 'flex' : 'none'}}
            value={rewriteSmodinConfig} onValueChange={setRewriteSmodinConfig} >
        </SmodinRewriteConfig>
        <View style={{ display: writingMode === 'topic_tagging' ? 'flex' : 'none'}}>
          <Text>No additional settings are available</Text>  
        </View>
      </View>
    </View>
  );
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig };
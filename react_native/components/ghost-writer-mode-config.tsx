import React, { FC, useState, useEffect } from 'react';
import { Alert, Dimensions, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { styles, mdScreenWidth } from './styles';
import { ArticleGeneratorRequest, CompletionParams, SmodinRewriteRequest, TextAnalysisTextSummarizationTextRequest } from './lib/types';
import { CompletionParamsTemplate, GhostWriterConfig } from './lib/writer-config';
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
  required?: boolean;
  initValue?: string;
  value?: string;
  checkValidity? (value: string) : InputValidity;
  onValueChange? (value: string) : void;
  validatorPreset? : 'number';
  validatorPresetOptions? : ValidatorPresetOptions;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: ViewStyle;
  messageStyle?: TextStyle;
}

class TextInputGroupWithValidityCheck extends React.Component<TextInputWithValidityCheckProps, { text?:string, error: string }> {
  private validityChecker = this.dummyValidityChecker;

  constructor(props: TextInputWithValidityCheckProps)
  {
    super(props);

    this.state = {
      text: props.initValue || props.value || '',
      error: ''
    };

    // set validity checker
    if (props.checkValidity) {
      this.validityChecker = props.checkValidity;
    } else if (props.validatorPreset === 'number') {
      this.validityChecker = this.numberValidityChecker.bind(this);
    } else {
      this.validityChecker = this.dummyValidityChecker;
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps !== this.props && typeof this.props.value !== 'undefined' && this.state.text != this.props.value) {
      this.setState({
        text: this.props.value || ''
      });
    }
  }

  dummyValidityChecker(value: string) {
    return {
      value: value,
      error: ''
    } as InputValidity;
  }

  numberValidityChecker(value : string) {
    let fieldName = (this.props.validatorPresetOptions && (this.props.validatorPresetOptions.fieldName || 'This')) || 'This';
    let intVal = (this.props.validatorPresetOptions && (this.props.validatorPresetOptions.intVal || false)) || false;
    let min = (this.props.validatorPresetOptions && this.props.validatorPresetOptions.min) || undefined;
    let max = (this.props.validatorPresetOptions && this.props.validatorPresetOptions.max) || undefined;

    let v = intVal ? Number.parseInt(value) : Number.parseFloat(value);
    let error = '';
    if (value) {
      if (Number.isNaN(v)) {
        error = `${fieldName} must be a number`;
      } else if ((typeof min !== 'undefined' && min !== null && v < min) || (typeof max !== 'undefined' && max !== null && v > max)) {
        if (typeof min !== 'undefined' && min !== null && typeof max !== 'undefined' && max !== null) { // both min and max are defined
          error = `${fieldName} must be in the range of ${min} ~ ${max}.`;
        } else if (typeof min !== 'undefined' && min !== null) { // only min is defined
          error = `${fieldName} must be greater than or equal to ${min}.`;
        } else if (typeof max !== 'undefined' && max !== null) { // only max is defined
          error = `${fieldName} must be less than or equal to ${max}.`;
        }
      }
    } else if(this.props.required) {
      error = `${fieldName} is required`;
    }

    return {
      value: error ? '' : value,
      error: error
    } as InputValidity
  };

  setText = (value: string) => {
    let error = '';
    let valid = this.validityChecker(value);
    if (valid && !valid.error) {
      this.props.onValueChange && this.props.onValueChange(value);
    } else {
      error = (valid && valid.error) || 'Your input is invalid'
    }

    this.setState({
      text: value,
      error: error,
    });
  }

  render() {
    const { width, height } = Dimensions.get('window');

    return (
      <View style={[styles.inputGroupContainer, this.props.style]}>
        <Text style={[styles.label, styles.inputGroupLabel, styles.md_1_3rd, this.props.labelStyle]}>{this.props.label}</Text>
        <View style={[styles.md_2_3rds]}>
          <TextInput
              multiline={this.props.multiline || false} numberOfLines={this.props.numberOfLines || 1}
              style={[styles.input, this.props.inputStyle]}
              value={this.state.text}
              onChange={ e => this.setText(e.nativeEvent.text) } >
          </TextInput>
          <Text style={[styles.textSmall, styles.textError, this.props.messageStyle, { display: this.state.error ? 'flex' : 'none' }]}>{this.state.error}</Text>
        </View>
      </View>
    );
  }
  
}

//-------------------------------------
// OpenAI Completion API
//-------------------------------------
interface OpenAiAutocompleteConfigProps {
  initValue?: CompletionParams;
  value?: CompletionParams;
  templates? : CompletionParamsTemplate[];
  onValueChange(value: CompletionParams) : void;
  style: ViewStyle;
}
interface OpenAiAutocompleteConfigState extends CompletionParams {
}

class OpenAiAutocompleteConfig extends React.Component<OpenAiAutocompleteConfigProps, OpenAiAutocompleteConfigState> {

  constructor(props: OpenAiAutocompleteConfigProps) {
    super(props);

    this.state = {
      prompt: props.initValue?.prompt || props.value?.prompt || '',
      n: props.initValue?.n || props.value?.n || 1,
      max_tokens: props.initValue?.max_tokens || props.value?.max_tokens,
      temperature: props.initValue?.temperature || props.value?.temperature,
      top_p: props.initValue?.top_p || props.value?.top_p,
      logprobs: props.initValue?.logprobs || props.value?.logprobs,
      echo: props.initValue?.echo || props.value?.echo,
      stop: (props.initValue?.stop || props.value?.stop || []).map(s => s.replaceAll('\n', '\\n').replaceAll('\t', '\\t')),
      presence_penalty: props.initValue?.presence_penalty || props.value?.presence_penalty || 0,
      frequency_penalty: props.initValue?.frequency_penalty || props.value?.frequency_penalty || 0,
      best_of: props.initValue?.best_of || props.value?.best_of || 1,
    };
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        prompt: this.props.value?.prompt || '',
        n: this.props.value?.n || 1,
        max_tokens: this.props.value?.max_tokens,
        temperature: this.props.value?.temperature,
        top_p: this.props.value?.top_p,
        logprobs: this.props.value?.logprobs,
        echo: this.props.value?.echo,
        stop: (this.props.value?.stop || []).map(s => s.replaceAll('\n', '\\n').replaceAll('\t', '\\t')),
        presence_penalty: this.props.value?.presence_penalty || 0,
        frequency_penalty: this.props.value?.frequency_penalty || 0,
        best_of: this.props.value?.best_of || 1,
      });
    }
  }

  onValueChange() {
    this.props.onValueChange &&
      this.props.onValueChange({
        prompt: this.state.prompt,
        n: this.state.n,
        max_tokens: this.state.max_tokens,
        temperature: this.state.temperature,
        top_p: this.state.top_p,
        logprobs: this.state.logprobs,
        echo: this.state.echo,
        stop: (this.state.stop || []).map(s => s.replaceAll('\n', '\\n').replaceAll('\t', '\\t')),
        presence_penalty: this.state.presence_penalty,
        frequency_penalty: this.state.frequency_penalty,
        best_of: this.state.best_of,
      } as CompletionParams);
  }

  copyFromTemplate(v: number) {
    if (v >= 0) {
      let template = this.props.templates? this.props.templates[v] : null;
      this.setState(template as CompletionParams);
    }
  }

  render() {
    return (
      <View style={[this.props.style]}>
        {
          this.props.templates && (
            <View style={[styles.inputGroupContainer]}>
              <Text style={[styles.label, styles.md_1_3rd]}>{'Choose a template'}</Text>
              <Picker style={[styles.picker, styles.md_2_3rds]} onValueChange={ v => this.copyFromTemplate(Number.parseInt(v as string)) }>
                <Picker.Item key={-1} label={'Choose a template'} value={-1} />
                {
                  this.props.templates.map((t, idx) => {
                    return (
                      <Picker.Item key={idx} label={t.name || 'Template' + (idx+1)} value={idx} />
                    );
                  })
                }
              </Picker>
            </View>
          )
        }

        <TextInputGroupWithValidityCheck label={'Prompt'} value={this.state.prompt} multiline={true} numberOfLines={5} required={true}
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
            onValueChange={ v => { this.setState({prompt: v}); this.onValueChange(); } } />

        <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={this.state.n?.toString()} required={true}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setState({ n: Number.parseInt(v) }); this.onValueChange(); } } />

        <TextInputGroupWithValidityCheck label={'Sampling Temperature'} value={this.state.temperature?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setState({ temperature : (v && Number.parseFloat(v)) || undefined }); this.onValueChange(); } } />

        <TextInputGroupWithValidityCheck label={'Nucleus Sampling Temperature'} value={this.state.top_p?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Nucleus Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setState({ top_p : (v && Number.parseFloat(v)) || undefined }); this.onValueChange(); } } />

        <View style={styles.inputGroupContainer}>
          <Text style={[styles.label, styles.inputGroupLabel, styles.md_1_3rd, {paddingTop: 8}]}>Stop Sequence</Text>
          <TagsInput style={styles.md_2_3rds} initialTags={this.state.stop} initialText={""} maxNumberOfTags={4}
              onChangeTags={ v => { this.setState({ stop: v }); this.onValueChange(); } } />
        </View>

        <TextInputGroupWithValidityCheck label={'Presence Penalty'} value={this.state.presence_penalty?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Presence Penalty', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setState({presence_penalty : (v && Number.parseFloat(v)) || undefined }); this.onValueChange(); } } />

        <TextInputGroupWithValidityCheck label={'Frequency Penalty'} value={this.state.frequency_penalty?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Frequency Penalty', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setState({frequency_penalty : (v && Number.parseFloat(v)) || undefined }); this.onValueChange(); } } />
      </View>
    );
  }
}


//-----------------------------------------
// Text Summarization API of TextAnalysis
//-----------------------------------------
interface TextAnalysisTextSummarizationConfigProps {
  initValue?: TextAnalysisTextSummarizationTextRequest,
  value?: TextAnalysisTextSummarizationTextRequest,
  onValueChange(value: TextAnalysisTextSummarizationTextRequest) : void;
  style: ViewStyle;
}

class TextAnalysisTextSummarizationConfig extends React.Component<TextAnalysisTextSummarizationConfigProps, {sentnum: number}> {

  constructor(props: TextAnalysisTextSummarizationConfigProps) {
    super(props);

    this.state = {
      sentnum: props.initValue?.sentnum || props.value?.sentnum || 5,
    };
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        sentnum: this.props.value?.sentnum || 5
      });
    }
  }

  onValueChange() {
    this.props.onValueChange &&
      this.props.onValueChange({
        sentnum: this.state.sentnum
      });
  }

  render() {
    return (
      <View style={this.props.style}>
        <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={this.state.sentnum?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setState({sentnum: Number.parseInt(v)}); this.onValueChange(); } } />
      </View>
    );
  }
  
}

//-----------------------------------------
// Rewrite API of Somdin
//-----------------------------------------
interface SmodinRewriteConfigProps {
  initValue?: SmodinRewriteRequest,
  value?: SmodinRewriteRequest,
  onValueChange(value: SmodinRewriteRequest) : void;
  style: ViewStyle;
}

class SmodinRewriteConfig extends React.Component<SmodinRewriteConfigProps, { language: string, strength: number }> {

  constructor (props: SmodinRewriteConfigProps) {
    super(props);

    this.state = {
      language : props.initValue?.language || props.value?.language || 'en',
      strength : props.initValue?.strength || props.value?.strength || 3,
    }
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        language : this.props.value?.language || 'en',
        strength : this.props.value?.strength || 3,
      });
    }
  }

  onValueChange () {
    this.props.onValueChange &&
      this.props.onValueChange({
        language: this.state.language,
        strength: this.state.strength,
      });
  }

  render() {
    return (
      <View style={this.props.style}>
        <Text>Language</Text> 
        <Picker
            selectedValue={this.state.language}
            style={[styles.picker]}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={v => { this.setState({ language : v }); this.onValueChange(); } }>
          <Picker.Item label="English" value="en" />
          <Picker.Item label="German" value="de" />
          <Picker.Item label="Spanish" value="es" />
          <Picker.Item label="French" value="fr" />
          <Picker.Item label="Arabic" value="ar" />
          <Picker.Item label="Chinese" value="zh" />
        </Picker>
        <Text>Strength</Text>
        <Picker
            selectedValue={this.state.strength.toString()}
            style={[styles.picker]}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { this.setState({ strength: Number.parseInt(v) }); this.onValueChange(); }}>
          <Picker.Item label="Strong" value="3" />
          <Picker.Item label="Medium" value="2" />
          <Picker.Item label="Basic" value="1" />
        </Picker>
      </View>
    );
  }
}

//-----------------------------------------
// Generate Article API
//-----------------------------------------
interface ArticleGeneratorConfigProps {
  initValue?: ArticleGeneratorRequest,
  value?: ArticleGeneratorRequest,
  onValueChange(value: ArticleGeneratorRequest) : void;
  style: ViewStyle;
}

class ArticleGeneratorConfig extends React.Component<ArticleGeneratorConfigProps, { num_serp_results?: number, num_outbound_links_per_serp_result?: number }> {

  constructor (props: ArticleGeneratorConfigProps) {
    super(props);

    this.state = {
      num_serp_results : props.initValue?.num_serp_results || props.value?.num_serp_results || undefined,
      num_outbound_links_per_serp_result : props.initValue?.num_outbound_links_per_serp_result || props.value?.num_outbound_links_per_serp_result || undefined,
    }
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        num_serp_results : this.props.value?.num_serp_results || 3,
        num_outbound_links_per_serp_result : this.props.value?.num_outbound_links_per_serp_result || 3,
      });
    }
  }

  onValueChange () {
    this.props.onValueChange &&
      this.props.onValueChange({
        seed_text: '',
        num_serp_results: this.state.num_serp_results,
        num_outbound_links_per_serp_result: this.state.num_outbound_links_per_serp_result,
      });
  }

  render() {
    return (
      <View style={this.props.style}>
        <TextInputGroupWithValidityCheck label={'Number of SERP API Results'} value={this.state.num_serp_results?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of SERP API Results', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setState({num_serp_results: Number.parseInt(v)}); this.onValueChange(); } } />

        <TextInputGroupWithValidityCheck label={'Number of outbound links per a SERP API Result'} value={this.state.num_outbound_links_per_serp_result?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of outbound links per a SERP API Result', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setState({num_outbound_links_per_serp_result: Number.parseInt(v)}); this.onValueChange(); } } />
      </View>
    );
  }
}


//-----------------------------------------
// Ghost Writer Mode config component
//-----------------------------------------
interface GhostWriterModeConfigProps {
  mode?: string;
  onModeChange(mode: string, modeConfig: any) : void;
}
interface GhostWriterModeConfigState {
  settingsVisible: boolean;
  writingMode: string;
}

class GhostWriterModeConfig extends React.Component<GhostWriterModeConfigProps, GhostWriterModeConfigState> {

  private autocompleteConfig: CompletionParams = {};
  private qaConfig: CompletionParams = {};
  private summaryConfig: CompletionParams = {};
  private rewriteConfig: CompletionParams = {};
  private rewriteSmodinConfig: SmodinRewriteRequest = { language: 'en', strength: 3, text: '' };
  private extractConfig: TextAnalysisTextSummarizationTextRequest = {};
  private articleGeneratorConfig : ArticleGeneratorRequest = {};

  private ghostWriterConfigPreset = new GhostWriterConfig();

  constructor(props: GhostWriterModeConfigProps) {
    super(props);

    this.state = {
      settingsVisible: false,
      writingMode: props.mode || 'autocomplete',
    };
    this.readFromData();
  }

  toggleSettingsView() {
    this.setState({
      settingsVisible: !this.state.settingsVisible
    });
  };

  setWritingMode(v: string) {
    this.setState({
      writingMode: v
    });
    this.onModePickerChange(true, v);
  }

  //
  // Read/Write to/from Store
  //
  async storeData() {
    try {
      const multiSet = [
        ['@gw__mode_config__autocomplete', JSON.stringify(this.autocompleteConfig)],
        ['@gw__mode_config__qa', JSON.stringify(this.qaConfig)],
        ['@gw__mode_config__summary', JSON.stringify(this.summaryConfig)],
        ['@gw__mode_config__rewrite', JSON.stringify(this.rewriteConfig)],
        ['@gw__mode_config__rewrite_smodin', JSON.stringify(this.rewriteSmodinConfig)],
        ['@gw__mode_config__extract', JSON.stringify(this.extractConfig)],
        ['@gw__mode_config__article_generator', JSON.stringify(this.articleGeneratorConfig)],
      ]
      await AsyncStorage.multiSet(multiSet);
    } catch (e) {
      // saving error
      console.log('GW mode configurator - Writing Error', e);
    }
  };
  async readFromData () {
    try {
      const multiGet = await AsyncStorage.multiGet([
        '@gw__mode_config__autocomplete',
        '@gw__mode_config__qa',
        '@gw__mode_config__summary',
        '@gw__mode_config__rewrite',
        '@gw__mode_config__rewrite_smodin',
        '@gw__mode_config__extract',
        '@gw__mode_config__article_generator',
      ]);
      this.autocompleteConfig = (multiGet[0][1] ? JSON.parse(multiGet[0][1]) : { prompt: '{USER_INPUT}', n: 1 }) as CompletionParams;
      this.qaConfig = (multiGet[1][1] ? JSON.parse(multiGet[1][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.QA_TEMPLATES[0]))) as CompletionParams;
      this.summaryConfig = (multiGet[2][1] ? JSON.parse(multiGet[2][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.SUMMARY_TEMPLATES[0]))) as CompletionParams;
      this.rewriteConfig = (multiGet[3][1] ? JSON.parse(multiGet[3][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.REWRITE_TEMPLATES[0]))) as CompletionParams;
      this.rewriteSmodinConfig = (multiGet[4][1] ? JSON.parse(multiGet[4][1]) : {}) as SmodinRewriteRequest;
      this.extractConfig = (multiGet[5][1] ? JSON.parse(multiGet[5][1]) : {}) as TextAnalysisTextSummarizationTextRequest;
      this.articleGeneratorConfig = (multiGet[6][1] ? JSON.parse(multiGet[6][1]) : { num_serp_results: 3, num_outbound_links_per_serp_result: 3 }) as ArticleGeneratorRequest;
    } catch (e) {
      // reading error
      console.log('GW mode configurator - Reading Error', e);
    }

    this.onModePickerChange(false);
  };
  
  onModePickerChange(updateStore=true, writingMode = ''){
    writingMode = writingMode || this.state.writingMode;
    if (this.props.onModeChange) {
      if (writingMode === 'autocomplete')
        this.props.onModeChange('autocomplete', this.autocompleteConfig);
      else if (writingMode === 'rewrite')
        this.props.onModeChange('rewrite', this.rewriteConfig);
      else if (writingMode === 'qa')
        this.props.onModeChange('qa', this.qaConfig);
      else if (writingMode === 'summary')
        this.props.onModeChange('summary', this.summaryConfig);
      else if (writingMode === 'extract')
        this.props.onModeChange('extract', this.extractConfig);
      else if (writingMode === 'topic-tagging')
        this.props.onModeChange('topic-tagging', null);
      else if (writingMode === 'rewrite-smodin')
        this.props.onModeChange('rewrite-smodin', this.rewriteSmodinConfig);
      else if (writingMode === 'generate-article')
        this.props.onModeChange('generate-article', this.articleGeneratorConfig);
    }

    if (updateStore)
      this.storeData();
  };

  //
  // View
  //
  render() {
    return (
      <View style={[styles.settingsContainer, { alignSelf: 'flex-start', marginTop: 10, marginBottom: 10, width: '100%', } ]}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.label]}>Mode: </Text>
          <View>
            <Picker style={[styles.modePicker]} itemStyle={styles.modePickerItemStyle}
                selectedValue={this.state.writingMode}
                onValueChange={ v => this.setWritingMode(v) }
                mode='dropdown' >
              <Picker.Item label="Auto-complete" value="autocomplete" />
              <Picker.Item label="Re-write (1st person)" value="rewrite" />
              <Picker.Item label="Q&A" value="qa" />
              <Picker.Item label="Summarize" value="summary" />
              <Picker.Item label="Key Sentences" value="extract" />
              <Picker.Item label="Topic Tagging" value='topic-tagging' />
              <Picker.Item label="Re-write" value="rewrite-smodin" />
              <Picker.Item label="Generate Article" value="generate-article" />
            </Picker>
          </View>
          <TouchableOpacity style={[styles.button, styles.buttonSm, { marginVertical: 0, marginHorizontal: 10 }]} onPress={() => this.toggleSettingsView() } >
            <Text style={[styles.buttonText, styles.buttonSmText]}>{ this.state.settingsVisible ? 'Hide' : 'Show' } Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={{ display: this.state.settingsVisible ? 'flex':'none', paddingVertical: 10 }}>
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === 'autocomplete' ? 'flex' : 'none'}}
              value={this.autocompleteConfig}
              onValueChange={v => { this.autocompleteConfig = v; this.onModePickerChange(); }} />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === 'rewrite' ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.REWRITE_TEMPLATES}
              value={this.rewriteConfig}
              onValueChange={v => {this.rewriteConfig = v; this.onModePickerChange(); }} />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === 'qa' ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.QA_TEMPLATES}
              value={this.qaConfig}
              onValueChange={v => {this.qaConfig = v; this.onModePickerChange(); }}  />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === 'summary' ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.SUMMARY_TEMPLATES}
              value={this.summaryConfig}
              onValueChange={v => {this.summaryConfig = v; this.onModePickerChange(); }} />
          <TextAnalysisTextSummarizationConfig style={{ display: this.state.writingMode === 'extract' ? 'flex' : 'none'}}
              value={this.extractConfig}
              onValueChange={v => {this.extractConfig = v; this.onModePickerChange(); }} />
          <SmodinRewriteConfig style={{ display: this.state.writingMode === 'rewrite-smodin' ? 'flex' : 'none'}}
              value={this.rewriteSmodinConfig}
              onValueChange={v => {this.rewriteSmodinConfig = v; this.onModePickerChange(); }} />
          <View style={{ display: this.state.writingMode === 'topic-tagging' ? 'flex' : 'none'}}>
            <Text>No additional settings are available</Text>  
          </View>
          <ArticleGeneratorConfig style={{ display: this.state.writingMode === 'generate-article' ? 'flex' : 'none'}}
              onValueChange={v => {this.articleGeneratorConfig = v; this.onModePickerChange(); }} />
        </View>
      </View>
    );
  }
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig };
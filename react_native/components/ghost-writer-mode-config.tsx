import React from 'react';
import { Dimensions, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox';
import { CheckBox as CheckBoxLegacy } from 'react-native';

import { styles, mdScreenWidth } from './styles';
import { ArticleGeneratorRequest, CompletionParams, ArticleRewriterRequest, TextAnalysisTextSummarizationTextRequest } from './lib/types';
import { CompletionParamsTemplate, GhostWriterConfig } from './lib/writer-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TagsInput } from './tags-input';


enum GhostWriterModes {
  AUTOCOMPLETE = 'autocomplete',
  REWRITE = 'rewrite',
  QA = 'qa',
  SUMMARY = 'summary',
  EXTRACT = 'extract',
  TOPIC_TAGGING = 'topic-tagging',
  REWRITE_TEXT = 'rewrite-article',
  GENERATE_ARTICLE = 'generate-article',
  REWRITE_FROM_URL = 'rewrite-from-url',
}

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
    if (!!value) {
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

  setStateWithValueChange(newState: any, changedStateNames: Array<String>=[]) {
    this.setState(newState);

    this.props.onValueChange &&
      this.props.onValueChange({
        prompt: changedStateNames.indexOf('prompt') < 0 ? this.state.prompt : newState.prompt,
        n: changedStateNames.indexOf('n') < 0 ? this.state.n : newState.n,
        max_tokens: changedStateNames.indexOf('max_tokens') < 0 ? this.state.max_tokens : newState.max_tokens,
        temperature: changedStateNames.indexOf('temperature') < 0 ? this.state.temperature : newState.temperature,
        top_p: changedStateNames.indexOf('top_p') < 0 ? this.state.top_p : newState.top_p,
        logprobs: changedStateNames.indexOf('logprobs') < 0 ? this.state.logprobs : newState.logprobs,
        echo: changedStateNames.indexOf('echo') < 0 ? this.state.echo : newState.echo,
        stop: ((changedStateNames.indexOf('stop') < 0 ? this.state.stop : newState.stop) || []).map((s: string) => s.replaceAll('\n', '\\n').replaceAll('\t', '\\t')),
        presence_penalty: changedStateNames.indexOf('presence_penalty') < 0 ? this.state.presence_penalty : newState.presence_penalty,
        frequency_penalty: changedStateNames.indexOf('frequency_penalty') < 0 ? this.state.frequency_penalty : newState.frequency_penalty,
        best_of: changedStateNames.indexOf('best_of') < 0 ? this.state.best_of : newState.best_of,
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
            onValueChange={ v => { this.setStateWithValueChange({prompt: v}, ['prompt']); } } />

        <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={this.state.n?.toString()} required={true}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setStateWithValueChange({ n: Number.parseInt(v) }, ['n']); } } />

        <TextInputGroupWithValidityCheck label={'Sampling Temperature'} value={this.state.temperature?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setStateWithValueChange({ temperature : (v && Number.parseFloat(v)) || undefined }, ['temperature']); } } />

        <TextInputGroupWithValidityCheck label={'Nucleus Sampling Temperature'} value={this.state.top_p?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Nucleus Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setStateWithValueChange({ top_p : (v && Number.parseFloat(v)) || undefined }, ['top_p']); } } />

        <View style={styles.inputGroupContainer}>
          <Text style={[styles.label, styles.inputGroupLabel, styles.md_1_3rd, {paddingTop: 8}]}>Stop Sequence</Text>
          <TagsInput style={styles.md_2_3rds} initialTags={this.state.stop} initialText={""} maxNumberOfTags={4}
              onChangeTags={ v => { this.setStateWithValueChange({ stop: v }, ['stop']); } } />
        </View>

        <TextInputGroupWithValidityCheck label={'Presence Penalty'} value={this.state.presence_penalty?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Presence Penalty', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setStateWithValueChange({presence_penalty : (v && Number.parseFloat(v)) || undefined }, ['presence_penalty']); } } />

        <TextInputGroupWithValidityCheck label={'Frequency Penalty'} value={this.state.frequency_penalty?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Frequency Penalty', intVal: false, min: 0.0, max: 1.0 }}
            onValueChange={ v => { this.setStateWithValueChange({frequency_penalty : (v && Number.parseFloat(v)) || undefined }, ['frequency_penalty']); } } />
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

  setStateWithValueChange(newState: any, changedStateNames: Array<String>=[]) {
    this.setState(newState);
    this.props.onValueChange &&
      this.props.onValueChange({
        sentnum: changedStateNames.indexOf('sentnum') < 0 ? this.state.sentnum : newState.sentnum,
      });
  }

  onValueChange() {
    
  }

  render() {
    return (
      <View style={this.props.style}>
        <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={this.state.sentnum?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setStateWithValueChange({sentnum: Number.parseInt(v)}, ['sentnum']); } } />
      </View>
    );
  }
  
}

//-----------------------------------------
// Rewrite API of Somdin
//-----------------------------------------
interface ArticleRewriterConfigProps {
  initValue?: ArticleRewriterRequest,
  value?: ArticleRewriterRequest,
  onValueChange(value: ArticleRewriterRequest) : void;
  showRewriteOption ?: boolean;
  style: ViewStyle;
}

class ArticleRewriterConfig extends React.Component<ArticleRewriterConfigProps, { language: string, strength: number, rewrite: boolean }> {

  constructor (props: ArticleRewriterConfigProps) {
    super(props);

    this.state = {
      language : props.initValue?.language || props.value?.language || 'en',
      strength : props.initValue?.strength || props.value?.strength || 3,
      rewrite : props.initValue?.rewrite === false ? false : true,
    }
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        language : this.props.value?.language || 'en',
        strength : this.props.value?.strength || 3,
        rewrite : this.props.value?.rewrite === false ? false : true,
      });
    }
  }

  setStateWithValueChange(newState: any, changedStateNames: Array<String>=[]) {
    this.setState(newState);
    this.props.onValueChange &&
      this.props.onValueChange({
        language: changedStateNames.indexOf('language') < 0 ? this.state.language : newState.language,
        strength: changedStateNames.indexOf('strength') < 0 ? this.state.strength : newState.strength,
        rewrite: changedStateNames.indexOf('rewrite') < 0 ? this.state.rewrite : newState.rewrite,
      });
  }

  render() {
    return (
      <View style={this.props.style}>
        <View style={[styles.inputGroupContainer]}>
          <Text style={[styles.label, styles.md_1_3rd]}>Language</Text>
          <Picker style={[styles.picker, styles.md_2_3rds]}
              selectedValue={this.state.language}
              itemStyle={styles.pickerItemStyle}
              mode='dropdown'
              onValueChange={v => { this.setStateWithValueChange({ language : v }, ['language']); } }>
            <Picker.Item label="English" value="en" />
            <Picker.Item label="German" value="de" />
            <Picker.Item label="Spanish" value="es" />
            <Picker.Item label="French" value="fr" />
            <Picker.Item label="Arabic" value="ar" />
            <Picker.Item label="Chinese" value="zh" />
          </Picker>
        </View>
        <View style={[styles.inputGroupContainer]}>
          <Text style={[styles.label, styles.md_1_3rd]}>Strength</Text>
          <Picker style={[styles.picker, styles.md_2_3rds]}
              selectedValue={this.state.strength.toString()}
              itemStyle={styles.pickerItemStyle}
              mode='dropdown'
              onValueChange={ v => { this.setStateWithValueChange({ strength: Number.parseInt(v) }, ['strength']); }}>
            <Picker.Item label="Strong" value="3" />
            <Picker.Item label="Medium" value="2" />
            <Picker.Item label="Basic" value="1" />
          </Picker>
        </View>
        <View style={[styles.inputGroupContainer, { display: this.props.showRewriteOption ? 'flex' : 'none'}]}>
        {
          CheckBox ?
          (
            <>
              <Text style={[styles.label, styles.md_1_3rd]}>Re-write</Text>
              <CheckBox value={this.state.rewrite}
                  onValueChange={(newValue) => this.setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
            </>
          )
          :
          (
            <>
              <Text style={[styles.label, styles.md_1_3rd]}>Re-write</Text>
              <CheckBoxLegacy value={this.state.rewrite}
                  onValueChange={(newValue) => this.setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
            </>
          )
        }
        </View>
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

interface ArticleGeneratorConfigStates {
  num_serp_results?: number;
  num_outbound_links_per_serp_result?: number;
  output_format: string;
  rewrite: boolean;
}

class ArticleGeneratorConfig extends React.Component<ArticleGeneratorConfigProps, ArticleGeneratorConfigStates> {

  constructor (props: ArticleGeneratorConfigProps) {
    super(props);

    this.state = {
      num_serp_results : props.initValue?.num_serp_results || props.value?.num_serp_results || 3,
      num_outbound_links_per_serp_result : props.initValue?.num_outbound_links_per_serp_result || props.value?.num_outbound_links_per_serp_result || 3,
      output_format: props.initValue?.output_format || props.value?.output_format || 'text',
      rewrite: true,
    }
    console.log(CheckBox, CheckBoxLegacy);
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        num_serp_results : this.props.value?.num_serp_results || 3,
        num_outbound_links_per_serp_result : this.props.value?.num_outbound_links_per_serp_result || 3,
        output_format: this.props.value?.output_format || 'text',
        rewrite: (this.props.value?.rewrite === false) ? false : true,
      });
    }
  }

  setStateWithValueChange(newState: any, changedStateNames: Array<String>=[]) {
    this.setState(newState);
    this.props.onValueChange &&
      this.props.onValueChange({
        num_serp_results: changedStateNames.indexOf('num_serp_results') < 0 ? this.state.num_serp_results : newState.num_serp_results,
        num_outbound_links_per_serp_result: changedStateNames.indexOf('num_outbound_links_per_serp_result') < 0 ? this.state.num_outbound_links_per_serp_result : newState.num_outbound_links_per_serp_result,
        output_format: changedStateNames.indexOf('output_format') < 0 ? this.state.output_format : newState.output_format,
        rewrite: changedStateNames.indexOf('rewrite') < 0 ? this.state.rewrite : newState.rewrite,
      });
  }

  render() {
    return (
      <View style={this.props.style}>
        <TextInputGroupWithValidityCheck label={'Number of SERP API Results'} value={this.state.num_serp_results?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of SERP API Results', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setStateWithValueChange({num_serp_results: (v && Number.parseInt(v)) || undefined}, ['num_serp_results']); } } />
        <TextInputGroupWithValidityCheck label={'Number of outbound links per a SERP API Result'} value={this.state.num_outbound_links_per_serp_result?.toString()}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of outbound links per a SERP API Result', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setStateWithValueChange({num_outbound_links_per_serp_result: (v && Number.parseInt(v)) || undefined}, ['num_outbound_links_per_serp_result']); } } />
        <View style={[styles.inputGroupContainer]}>
          <Text style={[styles.label, styles.md_1_3rd]}>Output Format</Text>
          <Picker style={[styles.picker, styles.md_2_3rds]}
              selectedValue={this.state.output_format.toString()}
              itemStyle={styles.pickerItemStyle}
              mode='dropdown'
              onValueChange={ v => { this.setStateWithValueChange({ output_format: v }, ['output_format']); }}>
            <Picker.Item label="Plain Text" value="text" />
            <Picker.Item label="Markdown" value="markdown" />
            <Picker.Item label="HTML" value="html" />
          </Picker>
        </View>
        <View style={[styles.inputGroupContainer]}>
        {
          CheckBox ?
          (
            <>
              <Text style={[styles.label, styles.md_1_3rd]}>Re-write</Text>
              <CheckBox value={this.state.rewrite}
                  onValueChange={(newValue) => this.setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
            </>
          )
          :
          (
            <>
              <Text style={[styles.label, styles.md_1_3rd]}>Re-write</Text>
              <CheckBoxLegacy value={this.state.rewrite}
                  onValueChange={(newValue) => this.setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
            </>
          )
        }
        </View>
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
  private rewriteSmodinConfig: ArticleRewriterRequest = { language: 'en', strength: 3, text: '' };
  private extractConfig: TextAnalysisTextSummarizationTextRequest = {};
  private articleGeneratorConfig : ArticleGeneratorRequest = {};
  private rewriteFromUrlConfig: ArticleRewriterRequest = { language: 'en', strength: 3, text: '' };

  private ghostWriterConfigPreset = new GhostWriterConfig();

  constructor(props: GhostWriterModeConfigProps) {
    super(props);

    this.state = {
      settingsVisible: false,
      writingMode: props.mode || GhostWriterModes.AUTOCOMPLETE,
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
        ['@gw__mode_config__rewrite_from_url', JSON.stringify(this.rewriteFromUrlConfig)],
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
        '@gw__mode_config__rewrite_from_url',
      ]);
      this.autocompleteConfig = (multiGet[0][1] ? JSON.parse(multiGet[0][1]) : { prompt: '{USER_INPUT}', n: 1 }) as CompletionParams;
      this.qaConfig = (multiGet[1][1] ? JSON.parse(multiGet[1][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.QA_TEMPLATES[0]))) as CompletionParams;
      this.summaryConfig = (multiGet[2][1] ? JSON.parse(multiGet[2][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.SUMMARY_TEMPLATES[0]))) as CompletionParams;
      this.rewriteConfig = (multiGet[3][1] ? JSON.parse(multiGet[3][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.REWRITE_TEMPLATES[0]))) as CompletionParams;
      this.rewriteSmodinConfig = (multiGet[4][1] ? JSON.parse(multiGet[4][1]) : {}) as ArticleRewriterRequest;
      this.extractConfig = (multiGet[5][1] ? JSON.parse(multiGet[5][1]) : {}) as TextAnalysisTextSummarizationTextRequest;
      this.articleGeneratorConfig = (multiGet[6][1] ? JSON.parse(multiGet[6][1]) : { num_serp_results: 3, num_outbound_links_per_serp_result: 3 }) as ArticleGeneratorRequest;
      this.rewriteFromUrlConfig = (multiGet[7][1] ? JSON.parse(multiGet[7][1]) : {}) as ArticleRewriterRequest;
    } catch (e) {
      // reading error
      console.log('GW mode configurator - Reading Error', e);
    }

    this.onModePickerChange(false);
  };
  
  onModePickerChange(updateStore=true, writingMode = ''){
    writingMode = writingMode || this.state.writingMode;
    if (this.props.onModeChange) {
      if (writingMode === GhostWriterModes.AUTOCOMPLETE)
        this.props.onModeChange(GhostWriterModes.AUTOCOMPLETE, this.autocompleteConfig);
      else if (writingMode === GhostWriterModes.REWRITE)
        this.props.onModeChange(GhostWriterModes.REWRITE, this.rewriteConfig);
      else if (writingMode === GhostWriterModes.QA)
        this.props.onModeChange(GhostWriterModes.QA, this.qaConfig);
      else if (writingMode === GhostWriterModes.SUMMARY)
        this.props.onModeChange(GhostWriterModes.SUMMARY, this.summaryConfig);
      else if (writingMode === GhostWriterModes.EXTRACT)
        this.props.onModeChange(GhostWriterModes.EXTRACT, this.extractConfig);
      else if (writingMode === GhostWriterModes.TOPIC_TAGGING)
        this.props.onModeChange(GhostWriterModes.TOPIC_TAGGING, null);
      else if (writingMode === GhostWriterModes.REWRITE_TEXT)
        this.props.onModeChange(GhostWriterModes.REWRITE_TEXT, this.rewriteSmodinConfig);
      else if (writingMode === GhostWriterModes.GENERATE_ARTICLE)
        this.props.onModeChange(GhostWriterModes.GENERATE_ARTICLE, this.articleGeneratorConfig);
      else if (writingMode === GhostWriterModes.REWRITE_FROM_URL)
        this.props.onModeChange(GhostWriterModes.REWRITE_FROM_URL, this.rewriteFromUrlConfig);
    }

    if (updateStore)
      this.storeData();
  };

  //
  // View
  //
  render() {
    const { width, height } = Dimensions.get('window');

    return (
      <View style={{ position: 'relative', backgroundColor: 'rgb(248, 248, 255)', zIndex: 100 }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 10 }}>
          <Text style={[styles.label, { display: width > mdScreenWidth ? 'flex' : 'none' }]}>Mode: </Text>
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
              <Picker.Item label="Re-write" value="rewrite-article" />
              <Picker.Item label="Generate Article (URL)" value="rewrite-from-url" />
              <Picker.Item label="Generate Article (Keywords)" value="generate-article" />
            </Picker>
          </View>
          <TouchableOpacity style={[styles.button, styles.buttonSm, { marginVertical: 0, marginHorizontal: 10 }]} onPress={() => this.toggleSettingsView() } >
            <Text style={[styles.buttonText, styles.buttonSmText]}>{ this.state.settingsVisible ? 'Hide' : 'Show' } Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsOverlay, { display: this.state.settingsVisible ? 'flex':'none' }]}>
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.AUTOCOMPLETE ? 'flex' : 'none'}}
              value={this.autocompleteConfig}
              onValueChange={v => { this.autocompleteConfig = v; this.onModePickerChange(); }} />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.REWRITE_TEMPLATES}
              value={this.rewriteConfig}
              onValueChange={v => {this.rewriteConfig = v; this.onModePickerChange(); }} />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.QA ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.QA_TEMPLATES}
              value={this.qaConfig}
              onValueChange={v => {this.qaConfig = v; this.onModePickerChange(); }}  />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.SUMMARY ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.SUMMARY_TEMPLATES}
              value={this.summaryConfig}
              onValueChange={v => {this.summaryConfig = v; this.onModePickerChange(); }} />
          <TextAnalysisTextSummarizationConfig style={{ display: this.state.writingMode === GhostWriterModes.EXTRACT ? 'flex' : 'none'}}
              value={this.extractConfig}
              onValueChange={v => {this.extractConfig = v; this.onModePickerChange(); }} />
          <ArticleRewriterConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE_TEXT ? 'flex' : 'none'}}
              value={this.rewriteSmodinConfig}
              onValueChange={v => {this.rewriteSmodinConfig = v; this.onModePickerChange(); }} />
          <View style={{ display: this.state.writingMode === GhostWriterModes.TOPIC_TAGGING ? 'flex' : 'none'}}>
            <Text>No additional settings are available</Text>  
          </View>
          <ArticleGeneratorConfig style={{ display: this.state.writingMode === GhostWriterModes.GENERATE_ARTICLE ? 'flex' : 'none'}}
              onValueChange={v => {this.articleGeneratorConfig = v; this.onModePickerChange(); }} />
          <ArticleRewriterConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE_FROM_URL ? 'flex' : 'none'}}
              value={this.rewriteFromUrlConfig}
              onValueChange={v => {this.rewriteFromUrlConfig = v; this.onModePickerChange(); }}
              showRewriteOption={true} />
        </View>
      </View>
    );
  }
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig, GhostWriterModes };
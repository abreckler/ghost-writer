import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { styles } from './styles';
import { CompletionParams } from '../lib/types';
import { CompletionParamsTemplate } from '../lib/writer-config';
import { TagsInput } from './TagsInput';
import { InputValidity, TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';


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
        max_tokens: this.props.value?.max_tokens || 16,
        temperature: this.props.value?.temperature || 1,
        top_p: this.props.value?.top_p || 1,
        logprobs: this.props.value?.logprobs,
        echo: this.props.value?.echo || false,
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

        <TextInputGroupWithValidityCheck label={'Max Number of Tokens (Length of Response)'} value={this.state.max_tokens?.toString()} required={true}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Max Number of Tokens (Length of Response)', intVal: true, min: 1, max: 2048 }}
            onValueChange={ v => { this.setStateWithValueChange({ max_tokens: Number.parseInt(v) }, ['max_tokens']); } } />

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

export { OpenAiAutocompleteConfigProps, OpenAiAutocompleteConfigState, OpenAiAutocompleteConfig }
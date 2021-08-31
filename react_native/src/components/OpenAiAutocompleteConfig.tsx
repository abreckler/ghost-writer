import React, { FC, useEffect, useState } from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { styles } from './styles';
import { CompletionParams } from '../lib/types';
import { CompletionParamsTemplate } from '../lib/writer-config';
import { TagsInput } from './TagsInput';
import { InputValidity, TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';
import { useAppSelector } from '../redux/hooks';


interface OpenAiAutocompleteConfigProps {
  initValue?: CompletionParams;
  value?: CompletionParams;
  templates? : CompletionParamsTemplate[];
  onValueChange(value: CompletionParams) : void;
  style: ViewStyle;
}

const OpenAiAutocompleteConfig: FC<OpenAiAutocompleteConfigProps> = (props) => {

  const [prompt, setPrompt] = useState(props.initValue?.prompt || props.value?.prompt || '');
  const [n, setN] = useState(props.initValue?.n || props.value?.n || 1);
  const [max_tokens, setMaxTokens] = useState(props.initValue?.max_tokens || props.value?.max_tokens);
  const [temperature, setTemperature] = useState(props.initValue?.temperature || props.value?.temperature);
  const [top_p, setTopP] = useState(props.initValue?.top_p || props.value?.top_p);
  const [logprobs, setLogprobs] = useState(props.initValue?.logprobs || props.value?.logprobs);
  const [echo, setEcho] = useState(props.initValue?.echo || props.value?.echo);
  const [stop, setStop] = useState((props.initValue?.stop || props.value?.stop || []).map(s => s.replace('\n', '\\n').replace('\t', '\\t')));
  const [presence_penalty, setPresencePenalty] = useState(props.initValue?.presence_penalty || props.value?.presence_penalty || 0);
  const [frequency_penalty, setFrequencyPenalty] = useState(props.initValue?.frequency_penalty || props.value?.frequency_penalty || 0);
  const [best_of, setBestOf] = useState(props.initValue?.best_of || props.value?.best_of || 1);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('prompt') && setPrompt(newState.prompt);
    changedStateNames.includes('n') && setN(newState.n);
    changedStateNames.includes('max_tokens') && setMaxTokens(newState.max_tokens);
    changedStateNames.includes('temperature') && setTemperature(newState.temperature);
    changedStateNames.includes('top_p') && setTopP(newState.top_p);
    changedStateNames.includes('logprobs') && setLogprobs(newState.logprobs);
    changedStateNames.includes('echo') && setEcho(newState.echo);
    changedStateNames.includes('stop') && setStop(newState.stop);
    changedStateNames.includes('presence_penalty') && setPresencePenalty(newState.presence_penalty);
    changedStateNames.includes('frequency_penalty') && setFrequencyPenalty(newState.frequency_penalty);
    changedStateNames.includes('best_of') && setBestOf(newState.best_of);

    props.onValueChange &&
      props.onValueChange({
        prompt: changedStateNames.indexOf('prompt') < 0 ? prompt : newState.prompt,
        n: changedStateNames.indexOf('n') < 0 ? n : newState.n,
        max_tokens: changedStateNames.indexOf('max_tokens') < 0 ? max_tokens : newState.max_tokens,
        temperature: changedStateNames.indexOf('temperature') < 0 ? temperature : newState.temperature,
        top_p: changedStateNames.indexOf('top_p') < 0 ? top_p : newState.top_p,
        logprobs: changedStateNames.indexOf('logprobs') < 0 ? logprobs : newState.logprobs,
        echo: changedStateNames.indexOf('echo') < 0 ? echo : newState.echo,
        stop: ((changedStateNames.indexOf('stop') < 0 ? stop : newState.stop) || []).map((s: string) => s.replace('\n', '\\n').replace('\t', '\\t')),
        presence_penalty: changedStateNames.indexOf('presence_penalty') < 0 ? presence_penalty : newState.presence_penalty,
        frequency_penalty: changedStateNames.indexOf('frequency_penalty') < 0 ? frequency_penalty : newState.frequency_penalty,
        best_of: changedStateNames.indexOf('best_of') < 0 ? best_of : newState.best_of,
      } as CompletionParams);
  }

  const copyFromTemplate = (v: number) => {
    if (v >= 0) {
      let template = props.templates? props.templates[v] : null;
      if (template) {
        setPrompt(template.prompt);
        setN(template.n);
        setMaxTokens(template.max_tokens);
        setTemperature(template.temperature);
        setTopP(template.top_p);
        setLogprobs(template.logprobs);
        setEcho(template.echo);
        setStop(template.stop);
        setPresencePenalty(template.presence_penalty);
        setFrequencyPenalty(template.frequency_penalty);
        setBestOf(template.best_of);
      }
    }
  }

  const layoutStyles = useAppSelector(state => state.styles.layoutStyles);

  return (
    <View style={[props.style]}>
      {
        props.templates && (
          <View style={layoutStyles.inputGroupContainer}>
            <Text style={layoutStyles.inputGroupLabel}>{'Choose a template'}</Text>
            <Picker style={[styles.picker, layoutStyles.inputGroupContainer]} onValueChange={ v => copyFromTemplate(Number.parseInt(v as string)) }>
              <Picker.Item key={-1} label={'Choose a template'} value={-1} />
              {
                props.templates.map((t, idx) => {
                  return (
                    <Picker.Item key={idx} label={t.name || 'Template' + (idx+1)} value={idx} />
                  );
                })
              }
            </Picker>
          </View>
        )
      }

      <TextInputGroupWithValidityCheck label={'Prompt'} value={prompt} multiline={true} numberOfLines={5} required={true}
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
          onValueChange={ v => { setStateWithValueChange({prompt: v}, ['prompt']); } } />

      <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={n?.toString()} required={true}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({ n: Number.parseInt(v) }, ['n']); } } />

      <TextInputGroupWithValidityCheck label={'Max Number of Tokens (Length of Response)'} value={max_tokens?.toString()} required={true}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Max Number of Tokens (Length of Response)', intVal: true, min: 1, max: 2048 }}
          onValueChange={ v => { setStateWithValueChange({ max_tokens: Number.parseInt(v) }, ['max_tokens']); } } />

      <TextInputGroupWithValidityCheck label={'Sampling Temperature'} value={temperature?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setStateWithValueChange({ temperature : (v && Number.parseFloat(v)) || undefined }, ['temperature']); } } />

      <TextInputGroupWithValidityCheck label={'Nucleus Sampling Temperature'} value={top_p?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Nucleus Sampling Temperature', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setStateWithValueChange({ top_p : (v && Number.parseFloat(v)) || undefined }, ['top_p']); } } />

      <View style={layoutStyles.inputGroupContainer}>
        <Text style={[layoutStyles.inputGroupLabel, {paddingTop: 8}]}>Stop Sequence</Text>
        <TagsInput style={layoutStyles.inputGroupInputContainer} initialTags={stop} initialText={""} maxNumberOfTags={4}
            onChangeTags={ v => { setStateWithValueChange({ stop: v }, ['stop']); } } />
      </View>

      <TextInputGroupWithValidityCheck label={'Presence Penalty'} value={presence_penalty?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Presence Penalty', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setStateWithValueChange({presence_penalty : (v && Number.parseFloat(v)) || undefined }, ['presence_penalty']); } } />

      <TextInputGroupWithValidityCheck label={'Frequency Penalty'} value={frequency_penalty?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Frequency Penalty', intVal: false, min: 0.0, max: 1.0 }}
          onValueChange={ v => { setStateWithValueChange({frequency_penalty : (v && Number.parseFloat(v)) || undefined }, ['frequency_penalty']); } } />
    </View>
  );
}

export { OpenAiAutocompleteConfigProps, OpenAiAutocompleteConfig }
import React from 'react';
import { View } from 'react-native';

import { CompletionParams } from '../lib/types';
import { TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';
import { OpenAiAutocompleteConfigProps, OpenAiAutocompleteConfigState } from './OpenAiAutocompleteConfig';


class OpenAiQaConfig extends React.Component<OpenAiAutocompleteConfigProps, OpenAiAutocompleteConfigState> {

  constructor(props: OpenAiAutocompleteConfigProps) {
    super(props);

    this.state = {
      n: props.initValue?.n || props.value?.n || 1,
    };
  }

  componentDidUpdate(prevProps: any) {
    if (this.props !== prevProps && typeof this.props.value !== 'undefined')
    {
      this.setState({
        n: this.props.value?.n || 1,
      });
    }
  }

  setStateWithValueChange(newState: any, changedStateNames: Array<String>=[]) {
    this.setState(newState);

    this.props.onValueChange &&
      this.props.onValueChange({
        n: changedStateNames.indexOf('n') < 0 ? this.state.n : newState.n,
      } as CompletionParams);
  }

  render() {
    return (
      <View style={[this.props.style]}>
        <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={this.state.n?.toString()} required={true}
            validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
            onValueChange={ v => { this.setStateWithValueChange({ n: Number.parseInt(v) }, ['n']); } } />
      </View>
    );
  }
}

export { OpenAiQaConfig }
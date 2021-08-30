import React from 'react';
import { View, ViewStyle } from 'react-native';

import { TextAnalysisTextSummarizationTextRequest } from '../lib/types';
import { TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';


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

export { TextAnalysisTextSummarizationConfig }
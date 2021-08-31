import React, { FC, useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';

import { TextAnalysisTextSummarizationTextRequest } from '../lib/types';
import { TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';


interface TextAnalysisTextSummarizationConfigProps {
  initValue?: TextAnalysisTextSummarizationTextRequest,
  value?: TextAnalysisTextSummarizationTextRequest,
  onValueChange(value: TextAnalysisTextSummarizationTextRequest) : void;
  style: ViewStyle;
}

const TextAnalysisTextSummarizationConfig: FC<TextAnalysisTextSummarizationConfigProps> = (props) => {

  const [sentnum, setSentnum] = useState(props.initValue?.sentnum || props.value?.sentnum || 5);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('sentnum') && setSentnum(newState.sentNum);

    props.onValueChange &&
      props.onValueChange({
        sentnum: changedStateNames.includes('sentnum') ? newState.sentnum : sentnum,
      });
  };

  return (
    <View style={props.style}>
      <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={sentnum?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({sentnum: Number.parseInt(v)}, ['sentnum']); } } />
    </View>
  );
  
}

export { TextAnalysisTextSummarizationConfig }
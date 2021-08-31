import React, { FC, useEffect, useState } from 'react';
import { View } from 'react-native';

import { CompletionParams } from '../lib/types';
import { TextInputGroupWithValidityCheck } from './TextInputGroupWithValidityCheck';
import { OpenAiAutocompleteConfigProps } from './OpenAiAutocompleteConfig';


const OpenAiQaConfig: FC<OpenAiAutocompleteConfigProps> = (props) => {

  const [n, setN] = useState(props.initValue?.n || props.value?.n || 1);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('n') && setN(newState.n);

    props.onValueChange &&
      props.onValueChange({
        n: changedStateNames.includes('n') ? newState.n : n,
      } as CompletionParams);
  }

  return (
    <View style={[props.style]}>
      <TextInputGroupWithValidityCheck label={'Number of answers to generate'} value={n?.toString()} required={true}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({ n: Number.parseInt(v) }, ['n']); } } />
    </View>
  );
}

export { OpenAiQaConfig }
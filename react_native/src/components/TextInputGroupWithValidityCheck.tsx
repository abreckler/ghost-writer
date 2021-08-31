import React, { FC, useEffect, useRef, useState } from 'react';
import { Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { styles } from './styles';


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
}

const TextInputGroupWithValidityCheck: FC<TextInputWithValidityCheckProps> = (props) => {

  const dummyValidityChecker = (value: string) => {
    return {
      value: value,
      error: ''
    } as InputValidity;
  };

  const numberValidityChecker = (value : string) => {
    let fieldName = (props.validatorPresetOptions && (props.validatorPresetOptions.fieldName || 'This')) || 'This';
    let intVal = (props.validatorPresetOptions && (props.validatorPresetOptions.intVal || false)) || false;
    let min = (props.validatorPresetOptions && props.validatorPresetOptions.min) || undefined;
    let max = (props.validatorPresetOptions && props.validatorPresetOptions.max) || undefined;

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
    } else if(props.required) {
      error = `${fieldName} is required`;
    }

    return {
      value: error ? '' : value,
      error: error
    } as InputValidity
  };

  const layoutStyles = useAppSelector(state => state.styles.layoutStyles);

  const [text, _setText] = useState(props.initValue || props.value || '');
  const [error, setError] = useState('');

    // set validity checker
  let validityChecker = dummyValidityChecker;
  if (props.checkValidity) {
    validityChecker = props.checkValidity;
  } else if (props.validatorPreset === 'number') {
    validityChecker = numberValidityChecker.bind(this);
  } else {
    validityChecker = dummyValidityChecker;
  }

  const timeoutForPropValueRef = useRef(null);

  const debounceTextChange = (newText: string) => {
    timeoutForPropValueRef.current && clearTimeout(timeoutForPropValueRef.current);

    timeoutForPropValueRef.current = setTimeout(() => {
      newText != text && setText(newText);
    }, 50);
  };

  useEffect(() => {
    props.value != text && debounceTextChange(props.value);
  }, [props.value]);

  const setText = (value: string) => {
    let error = '';
    let valid = validityChecker(value);
    if (valid && !valid.error) {
      props.onValueChange && props.onValueChange(value);
    } else {
      error = (valid && valid.error) || 'Your input is invalid'
    }

    _setText(value);
    setError(error);
  }

  return (
    <View style={layoutStyles.inputGroupContainer}>
      <Text style={layoutStyles.inputGroupLabel}>{props.label}</Text>
      <View style={layoutStyles.inputGroupInputContainer}>
        <TextInput
            multiline={props.multiline || false} numberOfLines={props.numberOfLines || 1}
            style={layoutStyles.inputGroupInput}
            value={text}
            onChange={ e => debounceTextChange(e.nativeEvent.text) } >
        </TextInput>
        <Text style={[styles.textSmall, styles.textError, { display: error ? 'flex' : 'none' }]}>{error}</Text>
      </View>
    </View>
  );

}

export { TextInputGroupWithValidityCheck, InputValidity }
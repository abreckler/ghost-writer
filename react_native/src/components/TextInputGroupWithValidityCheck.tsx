import React from 'react';
import { Dimensions, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
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

export { TextInputGroupWithValidityCheck, InputValidity }
import { Picker } from "@react-native-picker/picker";
import React from "react";
import { Text, View, ViewStyle, CheckBox as CheckBoxLegacy } from "react-native";
import CheckBox from '@react-native-community/checkbox';

import { ArticleGeneratorRequest } from "../lib/types";
import { styles } from "./styles";
import { TextInputGroupWithValidityCheck } from "./TextInputGroupWithValidityCheck";


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

export { ArticleGeneratorConfigProps, ArticleGeneratorConfig }
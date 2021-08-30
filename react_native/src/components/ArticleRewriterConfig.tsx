import React from "react";
import { Text, View, ViewStyle, CheckBox as CheckBoxLegacy } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { Picker } from "@react-native-picker/picker";

import { ArticleRewriterRequest } from "../lib/types";
import { styles } from "./styles";

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

export { ArticleRewriterConfigProps, ArticleRewriterConfig }
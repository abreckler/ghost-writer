import React, { FC, useState } from "react";
import { Text, View, ViewStyle, CheckBox as CheckBoxLegacy, StyleSheet } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { Picker } from "@react-native-picker/picker";

import { ArticleRewriterRequest } from "../lib/types";
import { styles } from "./styles";
import { useAppSelector } from "../redux/hooks";

interface ArticleRewriterConfigProps {
  initValue?: ArticleRewriterRequest,
  value?: ArticleRewriterRequest,
  onValueChange(value: ArticleRewriterRequest) : void;
  showRewriteOption ?: boolean;
  style: ViewStyle;
}

const ArticleRewriterConfig: FC<ArticleRewriterConfigProps> = (props) => {

  const [language, setLanguage] = useState(props.initValue?.language || props.value?.language || 'en');
  const [strength, setStrength] = useState(props.initValue?.strength || props.value?.strength || 3);
  const [rewrite, setRewrite] = useState(props.initValue?.rewrite === true ? true : false);


  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('language') && setLanguage(newState.language);
    changedStateNames.includes('strength') && setStrength(newState.strength);
    changedStateNames.includes('rewrite') && setRewrite(newState.rewrite);

    props.onValueChange &&
      props.onValueChange({
        language: changedStateNames.indexOf('language') < 0 ? language : newState.language,
        strength: changedStateNames.indexOf('strength') < 0 ? strength : newState.strength,
        rewrite: changedStateNames.indexOf('rewrite') < 0 ? rewrite : newState.rewrite,
      });
  }

  const layoutStyles = useAppSelector(state => state.styles.layoutStyles);

  return (
    <View style={props.style}>
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Language</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={language}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={v => { setStateWithValueChange({ language : v }, ['language']); } }>
          <Picker.Item label="English" value="en" />
          <Picker.Item label="German" value="de" />
          <Picker.Item label="Spanish" value="es" />
          <Picker.Item label="French" value="fr" />
          <Picker.Item label="Arabic" value="ar" />
          <Picker.Item label="Chinese" value="zh" />
        </Picker>
      </View>
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Strength</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={strength.toString()}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { setStateWithValueChange({ strength: Number.parseInt(v) }, ['strength']); }}>
          <Picker.Item label="Strong" value="3" />
          <Picker.Item label="Medium" value="2" />
          <Picker.Item label="Basic" value="1" />
        </Picker>
      </View>
      <View style={[layoutStyles.inputGroupContainer, { display: props.showRewriteOption ? 'flex' : 'none'}]}>
        <Text style={layoutStyles.inputGroupLabel}>Re-write</Text>
        {
          CheckBox ?
          (
            <CheckBox value={rewrite}
                onValueChange={(newValue) => setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
          )
          :
          (
            <CheckBoxLegacy value={rewrite}
                onValueChange={(newValue) => setStateWithValueChange({ rewrite: newValue }, ['rewrite'])} />
          )
        }
      </View>
    </View>
  );
}

export { ArticleRewriterConfigProps, ArticleRewriterConfig }
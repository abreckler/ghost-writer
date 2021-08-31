import React, { FC, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { ArticleSummarizerAPIs, ArticleSummarizerRequest } from "../lib/types";
import { styles } from "./styles";
import { useAppSelector } from "../redux/hooks";

interface ArticleSummarizerConfigProps {
  initValue?: ArticleSummarizerRequest,
  value?: ArticleSummarizerRequest,
  onValueChange(value: ArticleSummarizerRequest) : void;
  showRewriteOption ?: boolean;
  style: ViewStyle;
}

const ArticleSummarizerConfig: FC<ArticleSummarizerConfigProps> = (props) => {

  const [api, setApi] = useState(props.initValue?.api || props.value?.api || ArticleSummarizerAPIs.TEXT_MONKEY);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('api') && setApi(newState.api);

    props.onValueChange &&
      props.onValueChange({
        api: changedStateNames.indexOf('api') < 0 ? api : newState.api,
      });
  }

  const layoutStyles = useAppSelector(state => state.styles.layoutStyles);

  return (
    <View style={props.style}>
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Engine API</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={api}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={v => { setStateWithValueChange({ api : v }, ['api']); } }>
          <Picker.Item label="Text Monkey" value={ArticleSummarizerAPIs.TEXT_MONKEY} />
          <Picker.Item label="TextAnalysis" value={ArticleSummarizerAPIs.TEXT_ANALYSIS} />
        </Picker>
      </View>
    </View>
  );
}

export { ArticleSummarizerConfigProps, ArticleSummarizerConfig }
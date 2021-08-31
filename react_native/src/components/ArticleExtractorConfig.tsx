import React, { FC, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { ArticleExtractorRequest, ArticleExtractorAPIs } from "../lib/types";
import { styles } from "./styles";
import { useAppSelector } from "../redux/hooks";
import { TextInputGroupWithValidityCheck } from "./TextInputGroupWithValidityCheck";

interface ArticleExtractorConfigProps {
  initValue?: ArticleExtractorRequest,
  value?: ArticleExtractorRequest,
  onValueChange(value: ArticleExtractorRequest) : void;
  showRewriteOption ?: boolean;
  style: ViewStyle;
}

const ArticleExtractorConfig: FC<ArticleExtractorConfigProps> = (props) => {

  const [api, setApi] = useState(props.initValue?.api || props.value?.api || ArticleExtractorAPIs.TEXT_MONKEY);
  const [num_sentences, setNumSentences] = useState(props.initValue?.num_sentences || props.value?.num_sentences || 3);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('api') && setApi(newState.api);
    changedStateNames.includes('num_sentences') && setNumSentences(newState.num_sentences);

    props.onValueChange &&
      props.onValueChange({
        api: changedStateNames.indexOf('api') < 0 ? api : newState.api,
        num_sentences: changedStateNames.indexOf('num_sentences') < 0 ? num_sentences : newState.num_sentences,
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
          <Picker.Item label="Text Monkey" value={ArticleExtractorAPIs.TEXT_MONKEY} />
          <Picker.Item label="TextAnalysis" value={ArticleExtractorAPIs.TEXT_ANALYSIS} />
        </Picker>
      </View>
      <TextInputGroupWithValidityCheck label={'Number of sentences to extract'} value={num_sentences?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of answers to generate', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({num_sentences: Number.parseInt(v)}, ['num_sentences']); } } />
    </View>
  );
}

export { ArticleExtractorConfigProps, ArticleExtractorConfig }
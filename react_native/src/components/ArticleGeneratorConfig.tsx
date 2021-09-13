import { Picker } from "@react-native-picker/picker";
import React, { FC, useState } from "react";
import { Text, View, ViewStyle, CheckBox as CheckBoxLegacy } from "react-native";
import CheckBox from '@react-native-community/checkbox';

import { ArticleGeneratorRequest } from "../lib/types";
import { styles } from "./styles";
import { TextInputGroupWithValidityCheck } from "./TextInputGroupWithValidityCheck";
import { useAppSelector } from "../redux/hooks";


interface ArticleGeneratorConfigProps {
  initValue?: ArticleGeneratorRequest,
  value?: ArticleGeneratorRequest,
  onValueChange(value: ArticleGeneratorRequest) : void;
  style: ViewStyle;
}

enum GoogleSearchParamTbm {
  GoogleImagesAPI = 'isch',
  GoogleVideosAPI = 'vid',
  GoogleNewsAPI = 'nws',
  GoogleShoppingAPI = 'shop',
}

const ArticleGeneratorConfig: FC<ArticleGeneratorConfigProps> = (props) => {

  const [num_serp_results, setNumSerpResults] = useState(props.initValue?.num_serp_results || props.value?.num_serp_results || 3);
  const [num_outbound_links_per_serp_result, setNumOutboundLinksPerSerpResult]  = useState(props.initValue?.num_outbound_links_per_serp_result || props.value?.num_outbound_links_per_serp_result || 3);
  const [serp_google_tbm, setSerpGoogleTbm] = useState(props.initValue?.serp_google_tbm || props.value?.serp_google_tbm || '');
  const [serp_google_tbs_qdr, setSerpGoogleTbsQdr] = useState('');
  const [serp_google_tbs_sbd, setSerpGoogleTbsSbd] = useState(props.initValue?.serp_google_tbs_sbd === 1 ? 1 : 0);
  const [output_format, setOutputFormat]  = useState(props.initValue?.output_format || props.value?.output_format || 'text');
  const [rewrite, setRewrite] = useState(props.initValue?.rewrite === true ? true : false);

  const setStateWithValueChange = (newState: any, changedStateNames: Array<String>=[]) => {
    changedStateNames.includes('num_serp_results') && setNumSerpResults(newState.num_serp_results);
    changedStateNames.includes('num_outbound_links_per_serp_result') && setNumOutboundLinksPerSerpResult(newState.num_outbound_links_per_serp_result);
    changedStateNames.includes('serp_google_tbm') && setSerpGoogleTbm(newState.serp_google_tbm);
    changedStateNames.includes('serp_google_tbs_qdr') && setSerpGoogleTbsQdr(newState.serp_google_tbs_qdr);
    changedStateNames.includes('serp_google_tbs_sbd') && setSerpGoogleTbsSbd(newState.serp_google_tbs_sbd);
    changedStateNames.includes('output_format') && setOutputFormat(newState.output_format);
    changedStateNames.includes('rewrite') && setRewrite(newState.rewrite);
    
    props.onValueChange &&
      props.onValueChange({
        num_serp_results: changedStateNames.indexOf('num_serp_results') < 0 ? num_serp_results : newState.num_serp_results,
        num_outbound_links_per_serp_result: changedStateNames.indexOf('num_outbound_links_per_serp_result') < 0 ? num_outbound_links_per_serp_result : newState.num_outbound_links_per_serp_result,
        serp_google_tbm: changedStateNames.indexOf('serp_google_tbm') < 0 ? serp_google_tbm : newState.serp_google_tbm,
        serp_google_tbs_qdr: changedStateNames.indexOf('serp_google_tbs_qdr') < 0 ? serp_google_tbs_qdr : newState.serp_google_tbs_qdr,
        serp_google_tbs_sbd: changedStateNames.indexOf('serp_google_tbs_sbd') < 0 ? serp_google_tbs_sbd : newState.serp_google_tbs_sbd,
        output_format: changedStateNames.indexOf('output_format') < 0 ? output_format : newState.output_format,
        rewrite: changedStateNames.indexOf('rewrite') < 0 ? rewrite : newState.rewrite,
      });
  }

  const layoutStyles = useAppSelector(state => state.styles.layoutStyles);


  return (
    <View style={props.style}>
      <TextInputGroupWithValidityCheck label={'Number of SERP API Results'} value={num_serp_results?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of SERP API Results', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({num_serp_results: (v && Number.parseInt(v)) || undefined}, ['num_serp_results']); } } />
      <TextInputGroupWithValidityCheck label={'Number of outbound links per a SERP API Result'} value={num_outbound_links_per_serp_result?.toString()}
          validatorPreset='number' validatorPresetOptions={{ fieldName: 'Number of outbound links per a SERP API Result', intVal: true, min: 1, max: 10 }}
          onValueChange={ v => { setStateWithValueChange({num_outbound_links_per_serp_result: (v && Number.parseInt(v)) || undefined}, ['num_outbound_links_per_serp_result']); } } />
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Type of Search</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={output_format.toString()}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { setStateWithValueChange({ serp_google_tbm: v }, ['serp_google_tbm']); }}>
          <Picker.Item label="Not specified" value={undefined} />
          <Picker.Item label="Google News API" value={GoogleSearchParamTbm.GoogleNewsAPI} />
        </Picker>
      </View>
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Time Period</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={output_format.toString()}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { setStateWithValueChange({ serp_google_tbs_qdr: v }, ['serp_google_tbs_qdr']); }}>
          <Picker.Item label="Not specified" value={undefined} />
          <Picker.Item label="Past Year" value="y" />
          <Picker.Item label="Past Month" value="m" />
          <Picker.Item label="Past Week" value="w" />
          <Picker.Item label="Past 24 hours" value="d" />
          <Picker.Item label="Past Hour" value="h" />
        </Picker>
      </View>
      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Sort By</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={output_format.toString()}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { setStateWithValueChange({ serp_google_tbs_sbd: v }, ['serp_google_tbs_sbd']); }}>
          <Picker.Item label="Relevance" value={0} />
          <Picker.Item label="Date" value={1} />
        </Picker>
      </View>

      <View style={layoutStyles.inputGroupContainer}>
        <Text style={layoutStyles.inputGroupLabel}>Output Format</Text>
        <Picker style={[styles.picker, layoutStyles.inputGroupInputContainer]}
            selectedValue={output_format.toString()}
            itemStyle={styles.pickerItemStyle}
            mode='dropdown'
            onValueChange={ v => { setStateWithValueChange({ output_format: v }, ['output_format']); }}>
          <Picker.Item label="Plain Text" value="text" />
          <Picker.Item label="Markdown" value="markdown" />
          <Picker.Item label="HTML" value="html" />
        </Picker>
      </View>
      <View style={layoutStyles.inputGroupContainer}>
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

export { ArticleGeneratorConfigProps, ArticleGeneratorConfig }
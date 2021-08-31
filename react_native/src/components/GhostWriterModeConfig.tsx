import React, { FC, useState } from "react";
import { Text, StyleSheet } from "react-native";

import { GhostWriterConfig } from "../lib/writer-config";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { mainFontSize, mdScreenWidth, styles } from "./styles";
import { OpenAiAutocompleteConfig } from "./OpenAiAutocompleteConfig";
import { OpenAiQaConfig } from "./OpenAiQaConfig";
import { TextAnalysisTextSummarizationConfig } from "./TextAnalysisTextSummarizationConfig";
import { ArticleRewriterConfig } from "./ArticleRewriterConfig";
import { ArticleGeneratorConfig } from "./ArticleGeneratorConfig";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import {
  updateArticleGeneratorConfig, updateAutocompleteConfig,
  updateExtractConfig, updateQaConfig, updateRewriteConfig,
  updateRewriteFromUrlConfig, updateRewriteSmodinConfig,
  updateSummaryConfig, updateWritingMode
} from "../redux/slices/writerModConfigSlice";
import { GhostWriterFullLayouts } from "../lib/types";


enum GhostWriterModes {
  AUTOCOMPLETE = 'autocomplete',
  REWRITE = 'rewrite',
  QA = 'qa',
  SUMMARY = 'summary',
  EXTRACT = 'extract',
  TOPIC_TAGGING = 'topic-tagging',
  REWRITE_TEXT = 'rewrite-article',
  GENERATE_ARTICLE = 'generate-article',
  REWRITE_FROM_URL = 'rewrite-from-url',
}

interface GhostWriterModeConfigProps {
  mode?: string;
  layout: GhostWriterFullLayouts;
}

const GhostWriterModeConfig: FC<GhostWriterModeConfigProps> = (props: GhostWriterModeConfigProps) => {

  const writingMode = useAppSelector( state => state.writerModeConfigs.writingMode );
  const autocompleteConfig = useAppSelector( state => state.writerModeConfigs.autocompleteConfig );
  const qaConfig = useAppSelector( state => state.writerModeConfigs.qaConfig );
  const summaryConfig = useAppSelector( state => state.writerModeConfigs.summaryConfig );
  const rewriteConfig = useAppSelector( state => state.writerModeConfigs.rewriteConfig );
  const rewriteSmodinConfig = useAppSelector( state => state.writerModeConfigs.rewriteSmodinConfig );
  const extractConfig = useAppSelector( state => state.writerModeConfigs.extractConfig );
  const articleGeneratorConfig  = useAppSelector( state => state.writerModeConfigs.articleGeneratorConfig );
  const rewriteFromUrlConfig = useAppSelector( state => state.writerModeConfigs.rewriteFromUrlConfig );

  const dispatch = useAppDispatch( )

  const ghostWriterConfigPreset = new GhostWriterConfig();

  const [settingsVisible, setSettingsVisible] = useState(props.layout == GhostWriterFullLayouts.playground ? true : false);

  const { width, height } = Dimensions.get('window');
  const playgroundLayoutStyle = StyleSheet.create({
    btnToggleDetails: {
      display: "none",
    },
    containerDetails: {
      paddingHorizontal: width > mdScreenWidth ? 40 : 20,
      paddingVertical: 20,
    }
  });
  const simpleLayoutStyle = StyleSheet.create({
    btnToggleDetails: StyleSheet.flatten([
      styles.button,
      styles.buttonSm,
      {
        marginVertical: 0,
        marginHorizontal: 10,
      }
    ]),
    containerDetails: {
      width: '100%',
      paddingHorizontal: width > mdScreenWidth ? 40 : 20,
      paddingVertical: width > mdScreenWidth ? 40 : 20,
      position: 'absolute',
      backgroundColor: '#fff',
      opacity: 1,
      shadowColor: '#000',
      shadowOpacity: 0.4,
      shadowRadius: 10,
      zIndex: 100,
      top: mainFontSize * 4.2,
    }
  });

  const layoutStyle = props.layout == GhostWriterFullLayouts.playground ? playgroundLayoutStyle : simpleLayoutStyle;


  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  };

  return (
    <View style={{ position: 'relative', backgroundColor: 'rgb(248, 248, 255)', zIndex: 100 }}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 10 }}>
        <Text style={[styles.label, { display: width > mdScreenWidth ? 'flex' : 'none' }]}>Mode: </Text>
        <View>
          <Picker style={[styles.modePicker]} itemStyle={styles.modePickerItemStyle}
              selectedValue={writingMode}
              onValueChange={ v => dispatch(updateWritingMode(v)) }
              mode='dropdown' >
            <Picker.Item label="Auto-complete" value="autocomplete" />
            <Picker.Item label="Re-write (1st person)" value="rewrite" />
            <Picker.Item label="Q&A" value="qa" />
            <Picker.Item label="Summarize" value="summary" />
            <Picker.Item label="Key Sentences" value="extract" />
            <Picker.Item label="Topic Tagging" value='topic-tagging' />
            <Picker.Item label="Re-write" value="rewrite-article" />
            <Picker.Item label="Generate Article (URL)" value="rewrite-from-url" />
            <Picker.Item label="Generate Article (Keywords)" value="generate-article" />
          </Picker>
        </View>
        <TouchableOpacity style={layoutStyle.btnToggleDetails} onPress={() => toggleSettingsView() } >
          <Text style={[styles.buttonText, styles.buttonSmText]}>{ settingsVisible ? 'Hide' : 'Show' } Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={[layoutStyle.containerDetails, { display: settingsVisible ? 'flex':'none' }]}>
        <OpenAiAutocompleteConfig style={{ display: writingMode === GhostWriterModes.AUTOCOMPLETE ? 'flex' : 'none'}}
            value={autocompleteConfig}
            onValueChange={v => dispatch(updateAutocompleteConfig(v))} />
        <OpenAiAutocompleteConfig style={{ display: writingMode === GhostWriterModes.REWRITE ? 'flex' : 'none'}}
            templates = {ghostWriterConfigPreset.REWRITE_TEMPLATES}
            value={rewriteConfig}
            onValueChange={v => dispatch(updateRewriteConfig(v))} />
        <OpenAiQaConfig style={{ display: writingMode === GhostWriterModes.QA ? 'flex' : 'none'}}
            value={qaConfig}
            onValueChange={v => dispatch(updateQaConfig(v))}  />
        <OpenAiAutocompleteConfig style={{ display: writingMode === GhostWriterModes.SUMMARY ? 'flex' : 'none'}}
            templates = {ghostWriterConfigPreset.SUMMARY_TEMPLATES}
            value={summaryConfig}
            onValueChange={v => dispatch(updateSummaryConfig(v))} />
        <TextAnalysisTextSummarizationConfig style={{ display: writingMode === GhostWriterModes.EXTRACT ? 'flex' : 'none'}}
            value={extractConfig}
            onValueChange={v => dispatch(updateExtractConfig(v))} />
        <ArticleRewriterConfig style={{ display: writingMode === GhostWriterModes.REWRITE_TEXT ? 'flex' : 'none'}}
            value={rewriteSmodinConfig}
            onValueChange={v => dispatch(updateRewriteSmodinConfig(v))} />
        <View style={{ display: writingMode === GhostWriterModes.TOPIC_TAGGING ? 'flex' : 'none'}}>
          <Text>No additional settings are available</Text>  
        </View>
        <ArticleGeneratorConfig style={{ display: writingMode === GhostWriterModes.GENERATE_ARTICLE ? 'flex' : 'none'}}
            value={articleGeneratorConfig}
            onValueChange={v => dispatch(updateArticleGeneratorConfig(v))} />
        <ArticleRewriterConfig style={{ display: writingMode === GhostWriterModes.REWRITE_FROM_URL ? 'flex' : 'none'}}
            value={rewriteFromUrlConfig}
            onValueChange={v => dispatch(updateRewriteFromUrlConfig(v))}
            showRewriteOption={true} />
      </View>
    </View>
  );

}


export { GhostWriterModeConfigProps, GhostWriterModeConfig, GhostWriterModes };
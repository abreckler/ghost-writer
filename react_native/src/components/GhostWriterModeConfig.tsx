import React, { FC, useState } from "react";
import { Text, StyleSheet, ViewStyle } from "react-native";

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
  updateExtractConfig, updateExtractUrlConfig, updateQaConfig, updateRewriteConfig,
  updateRewriteFromUrlConfig, updateRewriteSmodinConfig,
  updateSummarizeArticleConfig,
  updateSummarizeUrlConfig,
  updateSummaryConfig, updateWritingMode
} from "../redux/slices/writerModConfigSlice";
import { GhostWriterFullLayouts } from "../lib/types";
import { ArticleExtractorConfig } from "./ArticleExtractorConfig";
import { ArticleSummarizerConfig } from "./ArticleSummarizerConfig";


enum GhostWriterModes {
  AUTOCOMPLETE = 'autocomplete',
  REWRITE = 'rewrite',
  QA = 'qa', 
  SUMMARY = 'summary',
  TOPIC_TAGGING = 'topic-tagging',
  REWRITE_TEXT = 'rewrite-article',
  GENERATE_ARTICLE = 'generate-article',
  REWRITE_FROM_URL = 'rewrite-from-url',
  EXTRACT_KEY_SENTENCES = 'extract-article',
  EXTRACT_FROM_URL = 'extract-from-url',
  SUMMARIZE_ARTICLE = 'summarize-article',
  SUMMARIZE_URL = 'summarize-url',
}

interface GhostWriterModeConfigProps {
  mode?: string;
  style?: ViewStyle;
  layout: GhostWriterFullLayouts;
}

const GhostWriterModeConfig: FC<GhostWriterModeConfigProps> = (props: GhostWriterModeConfigProps) => {

  const writingMode = useAppSelector( state => state.writerModeConfigs.writingMode );
  const autocompleteConfig = useAppSelector( state => state.writerModeConfigs.autocompleteConfig );
  const qaConfig = useAppSelector( state => state.writerModeConfigs.qaConfig );
  const summaryConfig = useAppSelector( state => state.writerModeConfigs.summaryConfig );
  const rewriteConfig = useAppSelector( state => state.writerModeConfigs.rewriteConfig );
  const rewriteSmodinConfig = useAppSelector( state => state.writerModeConfigs.rewriteSmodinConfig );
  const articleGeneratorConfig  = useAppSelector( state => state.writerModeConfigs.articleGeneratorConfig );
  const rewriteFromUrlConfig = useAppSelector( state => state.writerModeConfigs.rewriteFromUrlConfig );
  const extractConfig = useAppSelector( state => state.writerModeConfigs.extractConfig );
  const extractUrlConfig = useAppSelector( state => state.writerModeConfigs.extractUrlConfig );
  const summarizeArticleConfig = useAppSelector( state => state.writerModeConfigs.summarizeArticleConfig );
  const summarizeUrlConfig = useAppSelector( state => state.writerModeConfigs.summarizeUrlConfig );

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
    <View style={[{ position: 'relative', backgroundColor: 'rgb(248, 248, 255)', zIndex: 100 }, props.style]}>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 10 }}>
        <Text style={[styles.label, { display: props.layout == GhostWriterFullLayouts.simple && width > mdScreenWidth ? 'flex' : 'none' }]}>Mode: </Text>
        <View>
          <Picker style={[styles.modePicker]} itemStyle={styles.modePickerItemStyle}
              selectedValue={writingMode}
              onValueChange={ v => dispatch(updateWritingMode(v)) }
              mode='dropdown' >
            <Picker.Item label="Auto-complete (OpenAI)" value={GhostWriterModes.AUTOCOMPLETE} />
            <Picker.Item label="Re-write, 1st person (OpenAI)" value={GhostWriterModes.REWRITE} />
            <Picker.Item label="Q&A (OpenAI)" value={GhostWriterModes.QA} />
            <Picker.Item label="Summarize (OpenAI)" value={GhostWriterModes.SUMMARY} />
            <Picker.Item label="Topic Tagging" value={GhostWriterModes.TOPIC_TAGGING} />
            <Picker.Item label="Re-write" value={GhostWriterModes.REWRITE_TEXT} />
            <Picker.Item label="Create Article Outline (URL)" value={GhostWriterModes.REWRITE_FROM_URL} />
            <Picker.Item label="Create Article Outline (Keywords)" value={GhostWriterModes.GENERATE_ARTICLE} />
            <Picker.Item label="Summarize (Text)" value={GhostWriterModes.SUMMARIZE_ARTICLE} />
            <Picker.Item label="Summarize (URL)" value={GhostWriterModes.SUMMARIZE_URL} />
            <Picker.Item label="Key Sentences (Text)" value={GhostWriterModes.EXTRACT_KEY_SENTENCES} />
            <Picker.Item label="Key Sentences (URL)" value={GhostWriterModes.EXTRACT_FROM_URL} />
          </Picker>
        </View>
        <TouchableOpacity style={layoutStyle.btnToggleDetails} onPress={() => toggleSettingsView() } >
          <Text style={[styles.buttonText, styles.buttonSmText]}>{ settingsVisible ? 'Hide' : 'Show' } Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={[layoutStyle.containerDetails, { display: settingsVisible ? 'flex':'none', flex: 1, overflow: 'scroll' }]}>
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
        
        <View style={{ display: writingMode === GhostWriterModes.TOPIC_TAGGING ? 'flex' : 'none'}}>
          <Text>No additional settings are available</Text>  
        </View>

        <ArticleGeneratorConfig style={{ display: writingMode === GhostWriterModes.GENERATE_ARTICLE ? 'flex' : 'none'}}
            value={articleGeneratorConfig}
            onValueChange={v => dispatch(updateArticleGeneratorConfig(v))} />

        <ArticleRewriterConfig style={{ display: writingMode === GhostWriterModes.REWRITE_TEXT ? 'flex' : 'none'}}
            value={rewriteSmodinConfig}
            onValueChange={v => dispatch(updateRewriteSmodinConfig(v))} />
        <ArticleRewriterConfig style={{ display: writingMode === GhostWriterModes.REWRITE_FROM_URL ? 'flex' : 'none'}}
            value={rewriteFromUrlConfig}
            onValueChange={v => dispatch(updateRewriteFromUrlConfig(v))}
            showRewriteOption={true} />

        <ArticleExtractorConfig style={{ display: writingMode === GhostWriterModes.EXTRACT_KEY_SENTENCES ? 'flex' : 'none'}}
            value={extractConfig}
            onValueChange={v => dispatch(updateExtractConfig(v))}
            showRewriteOption={true} />
        <ArticleExtractorConfig style={{ display: writingMode === GhostWriterModes.EXTRACT_FROM_URL ? 'flex' : 'none'}}
            value={extractUrlConfig}
            onValueChange={v => dispatch(updateExtractUrlConfig(v))}
            showRewriteOption={true} />

        <ArticleSummarizerConfig style={{ display: writingMode === GhostWriterModes.SUMMARIZE_ARTICLE ? 'flex' : 'none'}}
            value={summarizeArticleConfig}
            onValueChange={v => dispatch(updateSummarizeArticleConfig(v))}
            showRewriteOption={true} />
        <ArticleSummarizerConfig style={{ display: writingMode === GhostWriterModes.SUMMARIZE_URL ? 'flex' : 'none'}}
            value={summarizeUrlConfig}
            onValueChange={v => dispatch(updateSummarizeUrlConfig(v))}
            showRewriteOption={true} />
      </View>
    </View>
  );

}


export { GhostWriterModeConfigProps, GhostWriterModeConfig, GhostWriterModes };
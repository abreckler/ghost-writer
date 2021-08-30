import React from "react";
import { Text } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ArticleGeneratorRequest, ArticleRewriterRequest, CompletionParams, TextAnalysisTextSummarizationTextRequest } from "../lib/types";
import { GhostWriterConfig } from "../lib/writer-config";
import { Dimensions, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { mdScreenWidth, styles } from "./styles";
import { OpenAiAutocompleteConfig } from "./OpenAiAutocompleteConfig";
import { OpenAiQaConfig } from "./OpenAiQaConfig";
import { TextAnalysisTextSummarizationConfig } from "./TextAnalysisTextSummarizationConfig";
import { ArticleRewriterConfig } from "./ArticleRewriterConfig";
import { ArticleGeneratorConfig } from "./ArticleGeneratorConfig";


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
  onModeChange(mode: string, modeConfig: any) : void;
}
interface GhostWriterModeConfigState {
  settingsVisible: boolean;
  writingMode: string;
}

class GhostWriterModeConfig extends React.Component<GhostWriterModeConfigProps, GhostWriterModeConfigState> {

  private autocompleteConfig: CompletionParams = {};
  private qaConfig: CompletionParams = {};
  private summaryConfig: CompletionParams = {};
  private rewriteConfig: CompletionParams = {};
  private rewriteSmodinConfig: ArticleRewriterRequest = { language: 'en', strength: 3, text: '' };
  private extractConfig: TextAnalysisTextSummarizationTextRequest = {};
  private articleGeneratorConfig : ArticleGeneratorRequest = {};
  private rewriteFromUrlConfig: ArticleRewriterRequest = { language: 'en', strength: 3, text: '' };

  private ghostWriterConfigPreset = new GhostWriterConfig();

  constructor(props: GhostWriterModeConfigProps) {
    super(props);

    this.state = {
      settingsVisible: false,
      writingMode: props.mode || GhostWriterModes.AUTOCOMPLETE,
    };
    this.readFromData();
  }

  toggleSettingsView() {
    this.setState({
      settingsVisible: !this.state.settingsVisible
    });
  };

  setWritingMode(v: string) {
    this.setState({
      writingMode: v
    });
    this.onModePickerChange(true, v);
  }

  //
  // Read/Write to/from Store
  //
  async storeData() {
    try {
      const multiSet = [
        ['@gw__mode_config__autocomplete', JSON.stringify(this.autocompleteConfig)],
        ['@gw__mode_config__qa', JSON.stringify(this.qaConfig)],
        ['@gw__mode_config__summary', JSON.stringify(this.summaryConfig)],
        ['@gw__mode_config__rewrite', JSON.stringify(this.rewriteConfig)],
        ['@gw__mode_config__rewrite_smodin', JSON.stringify(this.rewriteSmodinConfig)],
        ['@gw__mode_config__extract', JSON.stringify(this.extractConfig)],
        ['@gw__mode_config__article_generator', JSON.stringify(this.articleGeneratorConfig)],
        ['@gw__mode_config__rewrite_from_url', JSON.stringify(this.rewriteFromUrlConfig)],
      ]
      await AsyncStorage.multiSet(multiSet);
    } catch (e) {
      // saving error
      console.log('GW mode configurator - Writing Error', e);
    }
  };
  async readFromData () {
    try {
      const multiGet = await AsyncStorage.multiGet([
        '@gw__mode_config__autocomplete',
        '@gw__mode_config__qa',
        '@gw__mode_config__summary',
        '@gw__mode_config__rewrite',
        '@gw__mode_config__rewrite_smodin',
        '@gw__mode_config__extract',
        '@gw__mode_config__article_generator',
        '@gw__mode_config__rewrite_from_url',
      ]);
      this.autocompleteConfig = (multiGet[0][1] ? JSON.parse(multiGet[0][1]) : { prompt: '{USER_INPUT}', n: 1 }) as CompletionParams;
      this.qaConfig = (multiGet[1][1] ? JSON.parse(multiGet[1][1]) : { n: 1 }) as CompletionParams;
      this.summaryConfig = (multiGet[2][1] ? JSON.parse(multiGet[2][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.SUMMARY_TEMPLATES[0]))) as CompletionParams;
      this.rewriteConfig = (multiGet[3][1] ? JSON.parse(multiGet[3][1]) : JSON.parse(JSON.stringify(this.ghostWriterConfigPreset.REWRITE_TEMPLATES[0]))) as CompletionParams;
      this.rewriteSmodinConfig = (multiGet[4][1] ? JSON.parse(multiGet[4][1]) : {}) as ArticleRewriterRequest;
      this.extractConfig = (multiGet[5][1] ? JSON.parse(multiGet[5][1]) : {}) as TextAnalysisTextSummarizationTextRequest;
      this.articleGeneratorConfig = (multiGet[6][1] ? JSON.parse(multiGet[6][1]) : { num_serp_results: 3, num_outbound_links_per_serp_result: 3 }) as ArticleGeneratorRequest;
      this.rewriteFromUrlConfig = (multiGet[7][1] ? JSON.parse(multiGet[7][1]) : {}) as ArticleRewriterRequest;
    } catch (e) {
      // reading error
      console.log('GW mode configurator - Reading Error', e);
    }

    this.onModePickerChange(false);
  };
  
  onModePickerChange(updateStore=true, writingMode = ''){
    writingMode = writingMode || this.state.writingMode;
    if (this.props.onModeChange) {
      if (writingMode === GhostWriterModes.AUTOCOMPLETE)
        this.props.onModeChange(GhostWriterModes.AUTOCOMPLETE, this.autocompleteConfig);
      else if (writingMode === GhostWriterModes.REWRITE)
        this.props.onModeChange(GhostWriterModes.REWRITE, this.rewriteConfig);
      else if (writingMode === GhostWriterModes.QA)
        this.props.onModeChange(GhostWriterModes.QA, this.qaConfig);
      else if (writingMode === GhostWriterModes.SUMMARY)
        this.props.onModeChange(GhostWriterModes.SUMMARY, this.summaryConfig);
      else if (writingMode === GhostWriterModes.EXTRACT)
        this.props.onModeChange(GhostWriterModes.EXTRACT, this.extractConfig);
      else if (writingMode === GhostWriterModes.TOPIC_TAGGING)
        this.props.onModeChange(GhostWriterModes.TOPIC_TAGGING, null);
      else if (writingMode === GhostWriterModes.REWRITE_TEXT)
        this.props.onModeChange(GhostWriterModes.REWRITE_TEXT, this.rewriteSmodinConfig);
      else if (writingMode === GhostWriterModes.GENERATE_ARTICLE)
        this.props.onModeChange(GhostWriterModes.GENERATE_ARTICLE, this.articleGeneratorConfig);
      else if (writingMode === GhostWriterModes.REWRITE_FROM_URL)
        this.props.onModeChange(GhostWriterModes.REWRITE_FROM_URL, this.rewriteFromUrlConfig);
    }

    if (updateStore)
      this.storeData();
  };

  //
  // View
  //
  render() {
    const { width, height } = Dimensions.get('window');

    return (
      <View style={{ position: 'relative', backgroundColor: 'rgb(248, 248, 255)', zIndex: 100 }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10, paddingHorizontal: 10 }}>
          <Text style={[styles.label, { display: width > mdScreenWidth ? 'flex' : 'none' }]}>Mode: </Text>
          <View>
            <Picker style={[styles.modePicker]} itemStyle={styles.modePickerItemStyle}
                selectedValue={this.state.writingMode}
                onValueChange={ v => this.setWritingMode(v) }
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
          <TouchableOpacity style={[styles.button, styles.buttonSm, { marginVertical: 0, marginHorizontal: 10 }]} onPress={() => this.toggleSettingsView() } >
            <Text style={[styles.buttonText, styles.buttonSmText]}>{ this.state.settingsVisible ? 'Hide' : 'Show' } Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.settingsOverlay, { display: this.state.settingsVisible ? 'flex':'none' }]}>
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.AUTOCOMPLETE ? 'flex' : 'none'}}
              value={this.autocompleteConfig}
              onValueChange={v => { this.autocompleteConfig = v; this.onModePickerChange(); }} />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.REWRITE_TEMPLATES}
              value={this.rewriteConfig}
              onValueChange={v => {this.rewriteConfig = v; this.onModePickerChange(); }} />
          <OpenAiQaConfig style={{ display: this.state.writingMode === GhostWriterModes.QA ? 'flex' : 'none'}}
              value={this.qaConfig}
              onValueChange={v => {this.qaConfig = v; this.onModePickerChange(); }}  />
          <OpenAiAutocompleteConfig style={{ display: this.state.writingMode === GhostWriterModes.SUMMARY ? 'flex' : 'none'}}
              templates = {this.ghostWriterConfigPreset.SUMMARY_TEMPLATES}
              value={this.summaryConfig}
              onValueChange={v => {this.summaryConfig = v; this.onModePickerChange(); }} />
          <TextAnalysisTextSummarizationConfig style={{ display: this.state.writingMode === GhostWriterModes.EXTRACT ? 'flex' : 'none'}}
              value={this.extractConfig}
              onValueChange={v => {this.extractConfig = v; this.onModePickerChange(); }} />
          <ArticleRewriterConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE_TEXT ? 'flex' : 'none'}}
              value={this.rewriteSmodinConfig}
              onValueChange={v => {this.rewriteSmodinConfig = v; this.onModePickerChange(); }} />
          <View style={{ display: this.state.writingMode === GhostWriterModes.TOPIC_TAGGING ? 'flex' : 'none'}}>
            <Text>No additional settings are available</Text>  
          </View>
          <ArticleGeneratorConfig style={{ display: this.state.writingMode === GhostWriterModes.GENERATE_ARTICLE ? 'flex' : 'none'}}
              onValueChange={v => {this.articleGeneratorConfig = v; this.onModePickerChange(); }} />
          <ArticleRewriterConfig style={{ display: this.state.writingMode === GhostWriterModes.REWRITE_FROM_URL ? 'flex' : 'none'}}
              value={this.rewriteFromUrlConfig}
              onValueChange={v => {this.rewriteFromUrlConfig = v; this.onModePickerChange(); }}
              showRewriteOption={true} />
        </View>
      </View>
    );
  }
}


export { GhostWriterModeConfigProps, GhostWriterModeConfig, GhostWriterModes };
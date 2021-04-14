import React, { FC, useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import styles from './styles';

interface GhostWriterModeConfigProps {
  mode?: string;
  onModeChange(mode: string, modeConfig: any) : void;
}

const GhostWriterModeConfig: FC<GhostWriterModeConfigProps> = (props: GhostWriterModeConfigProps) => {
  const [writingMode, setWritingMode] = useState(props.mode || 'autocomplete');
  const [settingsVisible, setSettingsVisible] = useState(false);

  const toggleSettingsView = () => {
    setSettingsVisible(!settingsVisible);
  }

  const onModePickerChange = (value: string, idx: number) => {
    setWritingMode(value);
    props.onModeChange && props.onModeChange(writingMode, null);
  }

  return (
    <View style={[styles.settingsContainer, { alignSelf: 'flex-start', marginTop: 10, marginBottom: 10 } ]}>
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <View style={{display: 'flex', flex: 1}}>
          <Picker
              selectedValue={writingMode}
              style={[styles.modePicker]}
              itemStyle={styles.modePickerItemStyle}
              mode='dropdown'
              onValueChange={onModePickerChange}>
            <Picker.Item label="Auto-complete" value="autocomplete" />
            <Picker.Item label="Re-write (1st person)" value="rewrite" />
            <Picker.Item label="Q&A" value="qa" />
            <Picker.Item label="Summarize" value="summary" />
            <Picker.Item label="Key Sentences" value="extract" />
            <Picker.Item label="Topic Tagging" value="topic_tagging" />
            <Picker.Item label="Re-write" value="rewrite-smodin" />
          </Picker>
        </View>
        <TouchableOpacity style={[styles.button, styles.buttonSm, { marginVertical: 0, marginHorizontal: 10 }]} onPress={toggleSettingsView} >
          <Text style={[styles.buttonText, styles.buttonSmText]}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={{ display: settingsVisible ? 'flex':'none'}}>
        <View style={{ display: writingMode === 'autocomplete' ? 'flex' : 'none'}}>
          <Text>Auto-complete Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'rewrite' ? 'flex' : 'none'}}>
          <Text>Rewrite Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'qa' ? 'flex' : 'none'}}>
          <Text>QA Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'summary' ? 'flex' : 'none'}}>
          <Text>Summary Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'extract' ? 'flex' : 'none'}}>
          <Text>Extract Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'topic_tagging' ? 'flex' : 'none'}}>
          <Text>Topic Tagging Settings</Text>  
        </View>
        <View style={{ display: writingMode === 'rewrite-smodin' ? 'flex' : 'none'}}>
          <Text>Rewrite Settings</Text>  
        </View>
      </View>
    </View>
  );
}

export { GhostWriterModeConfigProps, GhostWriterModeConfig };
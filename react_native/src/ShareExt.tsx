import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import ShareExtension from 'react-native-share-extension';

import { styles } from './components/styles';
import { ShareExtWrapper } from './components/ShareExtWrapper';
import GhostWriterSimple from './components/GhostWriterSimple';


export default function ShareExt() {
  const [isOpen, setOpen] = useState(true);
  const [dataType, setDataType] = useState('');
  const [sharedValue, setSharedValue] = useState('');

  const getSharedData = async () => {
    try {
      const {type, value} = await ShareExtension.data()
      setDataType(type);
      setSharedValue(value);
      Alert.alert('Complete: ' + value);
    }
    catch(e) {
      Alert.alert('Error' + e);
      console.log('error', e);
    }
  }

  useEffect(() => {
    getSharedData();
  });

  const closing = () => {
    setOpen(false);
    ShareExtension.close();
  };

  return (
    <ShareExtWrapper style={styles.extModal} transparent={true} animationType="slide" visible={isOpen} onRequestClose={closing}>
      <View style={styles.container}>
        <View style={{flexDirection: "row", justifyContent: "space-between"}}>
          <Text style={styles.titleText}>Ghost Writer</Text>

          <TouchableOpacity onPress={closing} style={{paddingHorizontal: 10}}>
            <Text style={{fontSize: 42}}>&times;</Text>
          </TouchableOpacity>
        </View>

        <GhostWriterSimple seedText={sharedValue}></GhostWriterSimple>
      </View>
    </ShareExtWrapper>
  );
}

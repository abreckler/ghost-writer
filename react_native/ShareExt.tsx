import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Modal, Alert } from 'react-native';
import ShareExtension from 'react-native-share-extension';
import * as Linking from 'expo-linking';


type ShareExtState = {
  isOpen: boolean,
  type: string,
  value: string,
  buttonDisabled: boolean,
}

export default class ShareExt extends React.Component<{}, ShareExtState> {

  constructor(props: {}, context: any) {
    super(props, context);

    this.state = {
      isOpen: true,
      type: '',
      value: '',
      buttonDisabled: false,
    };
  }

  async componentDidMount() {
    try {
      const {type, value} = await ShareExtension.data()
      this.setState({
        type,
        value
      });
      Alert.alert('Complete: ' + value);
    }
    catch(e) {
      Alert.alert('Error' + e);
      console.log('error', e);
    }
  }

  closing = () => {
    this.setState({ isOpen: false });
    ShareExtension.close();
  };

  async invokeGhostWriter() {
    try {
      let url = Linking.createURL('/', {
        scheme: 'svghostwriter',
        queryParams:{
          text: this.state.value
        }
      });
      ShareExtension.openURL(url);
    }
    catch (e)
    {
      Alert.alert("Could not open the host app!");
    }
  }


  render() {
    return (
      <Modal style={styles.modal} transparent={true} visible={this.state.isOpen} onRequestClose={this.closing}>
        <View style={styles.container}>
          <Text style={styles.titleText}>Ghost Writer</Text>
          <TextInput style={styles.mainInput}
              multiline = {true}
              placeholder="Type here!"
              value = { this.state.value }
              onChangeText={ text => this.setState({value: text}) }></TextInput>
          <TouchableOpacity style={styles.button}
              disabled={ this.state.buttonDisabled }
              onPress={ this.invokeGhostWriter } >
            <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

}


const mainFontSize = 16;
const bgColor = '#fff';
const textColor = '#444';
const borderColor = '#ccc';
const primaryColor = 'rgb(70, 48, 235)';

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: bgColor,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  titleText: {
    fontSize: mainFontSize * 1.8,
    color: textColor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  mainInput: {
    flex: .4,
    width: '100%',
    padding: mainFontSize,
    fontSize: mainFontSize,
    color: textColor,
    borderColor: borderColor,
    borderWidth: 1,
  },

  button: {
    backgroundColor: primaryColor,
    padding: mainFontSize,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    fontSize: mainFontSize * 1.25,
    color: '#fff',
  },
});

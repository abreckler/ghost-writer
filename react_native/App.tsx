import React, { useState, FC } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TextStyle, Text, TextInput, TouchableOpacity, View, ListRenderItem } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';

import { CompletionResponse, CompletionChoice } from './openai';

interface IAnswerChoiceProps {
  choice?: any;
  onPress(e: any): void;
  style?: TextStyle;
};

const AnswerChoice: FC<IAnswerChoiceProps> = props => (
  <TouchableOpacity onPress={props.onPress} style={[styles.answerChoice, props.style]}>
    <Text style={styles.answerChoiceText}>{props.choice.text.trim()}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [text, setText] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [data, setData] = useState([
    {
      "text": " iOS extension points are unrelated to Mac extension points, and two iOS extensions can provide similar features even if they do so via different objects and properties. iOS Share extensions use the UIActivityViewController class, which uses a related class (UIActivityItemSource) for setting such parameters as the title, description, source identifier, and type value. A common iOS extension point is the",
      "index": 0,
      "logprobs": null,
      "finish_reason": "length"
    },
    {
      "text": " Share extensions are also useful in areas related to your app's task or content, including media editing, creation of custom objects, and so on. A global Share button in iOS displays any available Share extensions along with any custom Share extensions your app registers. Figure 19-1 shows three available Share extensions and a custom Share extension. Figure 19-1 Available and custom Share extensions When a user selects a",
      "index": 1,
      "logprobs": null,
      "finish_reason": "length"
    }
  ] as CompletionChoice[]);
  const API_KEY = 'sk-QaMxHjhRe0ez4v2Vnf6r2junMFSoZ03oZ8CkFdK4';
  const ENGINE = 'davinci';
  const linking = {
    prefixes: [
      Linking.createURL('/'),
      'https://app.ghost_writer.com',
    ],
  };

  /**
   * Calculate max_tokens to be passed on API call, based on text selection
   * NOTE: One token is roughly 4 characters for normal English text
   */
  const calculateTokens = () : Number => {
    // Now suggestion text will be rougly the same length as the selected text.
    return Math.min(Math.ceil(text.length / 4), 1024);
  }

  const createCompletion = async () => {
    setButtonDisabled(true);

    // call OpenAI API
    // @see https://beta.openai.com/docs/api-reference/create-completion
    let response = await fetch('https://api.openai.com/v1/engines/'+ ENGINE +'/completions', {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + API_KEY
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({
        prompt: text,
        n: 2,
        max_tokens: calculateTokens()
      }) // body data type must match "Content-Type" header
    });

    let json : CompletionResponse = await response.json();

    if (json.choices) {
      setData(json.choices);
    } else {
      setData([]);
    }

    setButtonDisabled(false);
  };

  const answerclicked = (choice: CompletionChoice) => {
    Clipboard.setString(choice.text || '');
    alert('Answer is copied to the clipboard!');
  };

  const renderAnswerChoice : ListRenderItem<CompletionChoice> = (info) => {
    return (
      <AnswerChoice
        choice={info.item}
        onPress={() => answerclicked(info.item)}
        style={{}}
      />
    );
  };
  
  return (
    <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
      <View style={styles.container}>
        <Text style={styles.titleText}>Ghost Writer</Text>
        <TextInput style={styles.mainInput}
            multiline = {true}
            placeholder="Type here!"
            onChangeText={text => setText(text)}></TextInput>
        <TouchableOpacity style={styles.button}
            disabled={buttonDisabled}
            onPress={createCompletion} >
          <Text style={styles.buttonText}>Summon Ghost Writer!</Text>
        </TouchableOpacity>
        <SafeAreaView style={styles.answerChoiceListContainer}>
          <FlatList style={styles.answerChoiceList}
            data={data}
            renderItem={renderAnswerChoice}
            keyExtractor={item => item.index?.toString() || Math.random().toString()}
          />
        </SafeAreaView>
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
}

const mainFontSize = 16;
const textColor = '#444';
const borderColor = '#ccc';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20
  },

  titleText: {
    fontSize: mainFontSize * 2,
    color: textColor,
    alignSelf: 'flex-start',
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
    backgroundColor: 'rgb(70, 48, 235)',
    padding: 20,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    fontSize: mainFontSize * 1.25,
    color: '#fff',
  },

  answerChoiceListContainer: {
    flex: .4,
  },
  answerChoiceList: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: mainFontSize,
  },
  answerChoice: {
    borderBottomColor: borderColor,
    borderBottomWidth: 1,
    padding: mainFontSize / 2,
  },
  answerChoiceText: {
    fontSize: mainFontSize,
    color: textColor,
  },
});

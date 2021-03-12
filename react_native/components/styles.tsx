import { StyleSheet } from 'react-native';

const mainFontSize = 16;
const bgColor = '#f8f8ff';
const textColor = '#444';
const borderColor = '#ccc';
const primaryColor = 'rgb(70, 48, 235)';

const styles = StyleSheet.create({
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

  modePicker: {
    fontSize: mainFontSize * 1.25,
    padding: mainFontSize,
    paddingRight: mainFontSize,
    borderRadius: 5,
    margin: 10,
  },

  answerChoiceListContainer: {
    flex: .4,
    flexGrow: 1,
    width: '100%',
  },
  answersAlert: {
    fontSize: mainFontSize * .9,
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

  extModal: {
	backgroundColor: 'transparent',
  }
});

export default styles;
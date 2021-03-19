import { Platform, StyleSheet } from 'react-native';

const mainFontSize = 16;
const bgColor = '#f8f8ff';
const textColor = '#444';
const borderColor = '#ccc';
const primaryColor = 'rgb(70, 48, 235)';

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    padding: 20,
    flex: 1,
  },

  titleText: {
    fontSize: mainFontSize * 1.8,
    color: textColor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  mainInputContainer: {
    flex: 0.4,
    flexShrink: 0,
    paddingVertical: mainFontSize / 2,
    paddingHorizontal: mainFontSize,
    borderColor: borderColor,
    borderWidth: 1,
  },
  mainInput: {
    flex: 1,
    width: '100%',
    fontSize: mainFontSize,
    color: textColor,
  },

  settingsContainer: {
    flexBasis: mainFontSize*20,
    flexShrink: 0,
    flexGrow: 0,
  },
  settingsLabel: {
    fontSize: mainFontSize,
    marginTop: mainFontSize * 1.5,
  },
  modePicker: {
    fontSize: mainFontSize * 1.25,
  },

  buttonsContainer: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: primaryColor,
    padding: mainFontSize,
    borderRadius: 5,
    margin: 10,
    flexDirection: "row",
  },
  buttonText: {
    fontSize: mainFontSize * 1.25,
    color: '#fff',
  },

  answerChoiceListContainer: {
    flex: 0.4,
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
    flex: Platform.OS == 'macos' ? 1 : undefined,
  },
  closeExtButton: {
    paddingHorizontal: 10,
    display: Platform.OS === 'macos' ? 'none' : 'flex',
  },
});

export default styles;
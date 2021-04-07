import { Platform, StyleSheet, Dimensions } from 'react-native';

const mainFontSize = 16;
const bgColor = '#f8f8ff';
const textColor = '#444';
const darkTextcolor = '#333';
const borderColor = '#ccc';
const primaryColor = 'rgb(70, 48, 235)';
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    padding: 20,
    flex: 1,
  },

  titleText: {
    fontSize: mainFontSize * 1.8,
    color: darkTextcolor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  gwSimple: {
    flexDirection: width > 600 ? 'row' : 'column',
    flex: width > 600 ? 0.7 : 0.9,
  },

  gwInputContainer: {
    flex: 0.5,
    borderColor: borderColor,
    borderWidth: 1,
  },
  gwInput: {
    flex: 1,
    width: '100%',
    fontSize: mainFontSize,
    color: textColor,
    paddingVertical: mainFontSize / 2,
    paddingHorizontal: mainFontSize,
  },

  gwAnswersContainer: {
    flex: 0.5,
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

  settingsContainer: {
    flexShrink: 0,
    flexGrow: 0,
    display: width > 600 ? 'flex' : 'none',
  },
  settingsLabel: {
    fontSize: mainFontSize,
    marginTop: mainFontSize * 1.5,
    color: darkTextcolor,
  },
  modePicker: {
    fontSize: mainFontSize * 1.25,
    flexBasis: 50,
  },
  modePickerItemStyle: {
    fontSize: mainFontSize,
  },

  buttonsContainerSm: {
    display: width > 600 ? 'none' : 'flex',
  },
  buttonsContainerMdUp: {
    display: width > 600 ? 'flex' : 'none',
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
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
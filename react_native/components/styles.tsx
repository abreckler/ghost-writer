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

  // basic components
  label: {
    fontSize: mainFontSize,
  },
  textSmall: {
    fontSize: mainFontSize * 0.8,
  },
  picker: {
    fontSize: mainFontSize,
    paddingVertical: mainFontSize / 4.0,
  },
  pickerItemStyle: {
    fontSize: mainFontSize,
  },
  input: {
    fontSize: mainFontSize,
    color: textColor,
    paddingVertical: mainFontSize / 4.0,
    paddingHorizontal: mainFontSize / 2.0,
    borderColor: borderColor,
    borderWidth: 1,
  },
  // buttons
  button: {
    backgroundColor: primaryColor,
    padding: mainFontSize,
    borderRadius: 5,
    margin: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: width > 600 ? mainFontSize * 1.25 : mainFontSize,
    color: '#fff',
  },
  buttonSm: {
    padding: mainFontSize * 0.8,
  },
  buttonSmText: {
    fontSize: width > 600 ? mainFontSize * 1 : mainFontSize * 0.85,
  },

  // 
  titleText: {
    fontSize: mainFontSize * 1.8,
    color: darkTextcolor,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  gwInputContainer: {
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
    display: 'flex',
  },
  settingsLabel: {
    fontSize: mainFontSize,
    marginTop: mainFontSize * 1.5,
    color: darkTextcolor,
  },

  // mode picker
  modePicker: {
    fontSize: width > 600 ? mainFontSize * 1.25 : mainFontSize,
    flexBasis: 50,
  },
  modePickerItemStyle: {
    fontSize: mainFontSize,
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },

  //
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
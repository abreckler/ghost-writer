import { Platform, StyleSheet, Dimensions } from 'react-native';

export const mainFontSize = 16;
export const bgColor = '#f8f8ff';
export const textColor = '#444';
export const errorColor = '#f00';
export const darkTextcolor = '#333';
export const borderColor = '#ccc';
export const primaryColor = 'rgb(70, 48, 235)';
export const { width, height } = Dimensions.get('window');
export const mdScreenWidth = 600;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: bgColor,
    padding: 20,
    flex: 1,
  },

  // grid
  md_row: {
    flexDirection: width > mdScreenWidth ? 'row' : 'column',
  },
  md_1_4th: {
    width: width > mdScreenWidth ? '25%' : '100%',
  },
  md_1_3rd: {
    width: width > mdScreenWidth ? '33.33333%' : '100%',
  },
  md_1_2nd: {
    width: width > mdScreenWidth ? '50%' : '100%',
  },
  md_2_3rds: {
    width: width > mdScreenWidth ? '66.66667%' : '100%',
  },
  md_3_4ths: {
    width: width > mdScreenWidth ? '75%' : '100%',
  },

  // basic components
  label: {
    fontSize: mainFontSize,
  },
  textSmall: {
    fontSize: mainFontSize * 0.8,
  },
  textError: {
    color: errorColor,
  },
  // picker
  picker: {
    fontSize: mainFontSize,
    paddingVertical: mainFontSize / 4.0,
  },
  pickerItemStyle: {
    fontSize: mainFontSize,
  },
  // text input
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
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    padding: mainFontSize / 2,
  },
  answerChoiceText: {
    fontSize: mainFontSize,
    color: textColor,
  },
  answerChoiceActions: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
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

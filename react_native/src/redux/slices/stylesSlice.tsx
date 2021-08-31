import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StyleSheet } from 'react-native';
import { mdScreenWidth, styles, width } from '../../components/styles';

import { GhostWriterFullLayouts } from "../../lib/types";


const initialState = {
	layout: GhostWriterFullLayouts.simple,
	layoutStyles: StyleSheet.create({
		inputGroupContainer: {
			flexDirection: width > mdScreenWidth ? 'row' : 'column',
			alignItems: 'flex-start',
			marginBottom: 4,
		},
		inputGroupLabel: StyleSheet.flatten([
			styles.label,
			{
				paddingTop: 4,
			},
			styles.md_1_3rd,
		]),
		inputGroupInputContainer: styles.md_2_3rds,
		inputGroupInput: styles.input,
	}),
};

export const stylesSlice = createSlice({
	name: 'writerModeConfig',
	initialState: initialState,
	reducers: {
		updateLayout: (state, action: PayloadAction<GhostWriterFullLayouts>) => {
			state.layout = action.payload;
			state.layoutStyles = StyleSheet.create({
				inputGroupContainer: {
					flexDirection: state.layout == GhostWriterFullLayouts.simple && width > mdScreenWidth ? 'row' : 'column',
					alignItems: state.layout == GhostWriterFullLayouts.simple && width > mdScreenWidth ? 'flex-start' : 'stretch',
					marginBottom: 4,
				},
				inputGroupLabel: StyleSheet.flatten([
					styles.label,
					{
						paddingTop: 4,
					},
					(state.layout == GhostWriterFullLayouts.simple ? styles.md_1_3rd : {}),
					
				]),
				inputGroupInputContainer: (state.layout == GhostWriterFullLayouts.simple ? styles.md_2_3rds : {}),
				inputGroupInput: StyleSheet.flatten([styles.input]),
			});
		},
	}
});

export const {
	updateLayout,
} = stylesSlice.actions;

export default stylesSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ArticleGeneratorRequest, ArticleRewriterRequest, CompletionParams, TextAnalysisTextSummarizationTextRequest } from "../../lib/types";


const initialState = {
	writingMode: 'autocomplete',
	autocompleteConfig: {} as CompletionParams,
	qaConfig: {} as CompletionParams,
  summaryConfig: {} as CompletionParams,
  rewriteConfig: {} as CompletionParams,
	rewriteSmodinConfig: { language: 'en', strength: 3, text: '' } as ArticleRewriterRequest,
  extractConfig: {} as TextAnalysisTextSummarizationTextRequest,
  articleGeneratorConfig : {} as ArticleGeneratorRequest,
  rewriteFromUrlConfig: { language: 'en', strength: 3, text: '' } as ArticleRewriterRequest,
};

export const writerModeConfigSlice = createSlice({
	name: 'writerModeConfig',
	initialState: initialState,
	reducers: {
		updateWritingMode: (state, action: PayloadAction<string>) => {
			state.writingMode = action.payload;
		},
		updateAutocompleteConfig: (state, action: PayloadAction<CompletionParams>) => {
			state.autocompleteConfig = {
				...state.autocompleteConfig,
				...action.payload,
			};
		},
		updateQaConfig: (state, action: PayloadAction<CompletionParams>) => {
			state.qaConfig = {
				...state.qaConfig,
				...action.payload,
			};
		},
		updateSummaryConfig: (state, action: PayloadAction<CompletionParams>) => {
			state.summaryConfig = {
				...state.summaryConfig,
				...action.payload,
			};
		},
		updateRewriteConfig: (state, action: PayloadAction<CompletionParams>) => {
			state.rewriteConfig = {
				...state.rewriteConfig,
				...action.payload,
			};
		},
		updateRewriteSmodinConfig: (state, action: PayloadAction<ArticleRewriterRequest>) => {
			state.rewriteSmodinConfig = {
				...state.rewriteSmodinConfig,
				...action.payload,
			};
		},
		updateExtractConfig: (state, action: PayloadAction<TextAnalysisTextSummarizationTextRequest>) => {
			state.extractConfig = {
				...state.extractConfig,
				...action.payload,
			};
		},
		updateArticleGeneratorConfig: (state, action: PayloadAction<ArticleGeneratorRequest>) => {
			state.articleGeneratorConfig = {
				...state.articleGeneratorConfig,
				...action.payload,
			};
		},
		updateRewriteFromUrlConfig: (state, action: PayloadAction<ArticleRewriterRequest>) => {
			state.rewriteFromUrlConfig = {
				...state.rewriteFromUrlConfig,
				...action.payload,
			};
		},
	}
});

export const {
	updateWritingMode,
	updateAutocompleteConfig,
	updateQaConfig,
	updateSummaryConfig,
	updateRewriteConfig,
	updateRewriteSmodinConfig,
	updateExtractConfig,
	updateArticleGeneratorConfig,
	updateRewriteFromUrlConfig
} = writerModeConfigSlice.actions;

export default writerModeConfigSlice.reducer;
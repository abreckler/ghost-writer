import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ArticleExtractorRequest, ArticleGeneratorRequest, ArticleRewriterRequest, ArticleSummarizerRequest, CompletionParams } from "../../lib/types";


const initialState = {
	writingMode: 'autocomplete',
	autocompleteConfig: {} as CompletionParams,
	qaConfig: {} as CompletionParams,
  summaryConfig: {} as CompletionParams,
  rewriteConfig: {} as CompletionParams,
	rewriteSmodinConfig: { language: 'en', strength: 3, text: '' } as ArticleRewriterRequest,
  articleGeneratorConfig : {} as ArticleGeneratorRequest,
  rewriteFromUrlConfig: { language: 'en', strength: 3, text: '' } as ArticleRewriterRequest,
	summarizeArticleConfig: { api: 'text-monkey' } as ArticleSummarizerRequest,
	summarizeUrlConfig: { api: 'text-monkey' } as ArticleSummarizerRequest,
	extractConfig: { api: 'textanalysis', num_sentences: 5 } as ArticleExtractorRequest,
	extractUrlConfig: { api: 'textanalysis', num_sentences: 5 } as ArticleExtractorRequest,
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
		updateExtractConfig: (state, action: PayloadAction<ArticleExtractorRequest>) => {
			state.extractConfig = {
				...state.extractConfig,
				...action.payload,
			};
		},
		updateExtractUrlConfig: (state, action: PayloadAction<ArticleExtractorRequest>) => {
			state.extractUrlConfig = {
				...state.extractUrlConfig,
				...action.payload,
			};
		},
		updateSummarizeArticleConfig: (state, action: PayloadAction<ArticleSummarizerRequest>) => {
			state.summarizeArticleConfig = {
				...state.summarizeArticleConfig,
				...action.payload,
			};
		},
		updateSummarizeUrlConfig: (state, action: PayloadAction<ArticleSummarizerRequest>) => {
			state.summarizeUrlConfig = {
				...state.summarizeUrlConfig,
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
	updateArticleGeneratorConfig,
	updateRewriteFromUrlConfig,
	updateExtractConfig,
	updateExtractUrlConfig,
	updateSummarizeArticleConfig,
	updateSummarizeUrlConfig,
} = writerModeConfigSlice.actions;

export default writerModeConfigSlice.reducer;
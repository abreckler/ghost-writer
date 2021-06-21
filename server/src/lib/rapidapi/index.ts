import RapidApiClient from './base';

import {
  TwinwordTopicTaggingGenerateRequest,
  TwinwordTopicTaggingGenerateResponse,
  TwinwordTopicTaggingApiClient,
} from './twinword';

import {
  TextAnalysisTextSummarizationApiClient,
  TextAnalysisTextSummarizationTextRequest,
  TextAnalysisTextSummarizationUrlRequest,
  TextAnalysisTextSummarizationResponse,
} from './textanalysis';

import { SmodinRewriterApiClient, SmodinRewriteRequest, SmodinRewriteResponse } from './smodin';

import {
  PipfeedArticleDataExtractorApiClient,
  PipfeedArticleDataExtractorRequest,
  PipfeedArticleDataExtractorResponse,
} from './pipfeed';

import {
  HealthyTechParaphraserApiClient,
  HealthyTechParaphraserRequest,
  HealthyTechParaphraserResponse,
} from './healthy-tech';

import {
  ZackproserUrlIntelligenceApiClient,
  ZackproserUrlIntelligenceRequest,
  ZackproserUrlIntelligenceResponse,
} from './zackproser';

import {
  ZombieBestAmazonProductsApiClient,
  ZombieBestAmazonProductDetailRequest,
  ZombieBestAmazonProductDetailResponse,
  ZombieBestASINRequest,
  ZombieBestASINResponse,
} from './amazon-products';

export {
  RapidApiClient,
  // Twinword - Topic tagging
  TwinwordTopicTaggingGenerateRequest,
  TwinwordTopicTaggingGenerateResponse,
  TwinwordTopicTaggingApiClient,
  // Textanalysis - Text summarization
  TextAnalysisTextSummarizationApiClient,
  TextAnalysisTextSummarizationTextRequest,
  TextAnalysisTextSummarizationUrlRequest,
  TextAnalysisTextSummarizationResponse,
  // Smodin - Rewriter
  SmodinRewriterApiClient,
  SmodinRewriteRequest,
  SmodinRewriteResponse,
  // Pipfeed - Article Data Extract and Summarize
  PipfeedArticleDataExtractorApiClient,
  PipfeedArticleDataExtractorRequest,
  PipfeedArticleDataExtractorResponse,
  // Healthy Tech - Paraphraser
  HealthyTechParaphraserApiClient,
  HealthyTechParaphraserRequest,
  HealthyTechParaphraserResponse,
  // Zackproser - URL intelligence
  ZackproserUrlIntelligenceApiClient,
  ZackproserUrlIntelligenceRequest,
  ZackproserUrlIntelligenceResponse,
  // ZombieBest - Amazon Products
  ZombieBestAmazonProductsApiClient,
  ZombieBestAmazonProductDetailRequest,
  ZombieBestAmazonProductDetailResponse,
  ZombieBestASINRequest,
  ZombieBestASINResponse,
};

// Open AI - GPT 3
export enum EngineID {
  Davinci = "davinci",
  Curie = "curie",
  Babbage = "babbage",
  Ada = "ada",
};

export interface CompletionParams {
  prompt?: string;
  max_tokens?: number; // Defaults to 16
  temperature?: number; // Defaults to 1
  top_p?: number; // Defaults to 1
  n?: number; // Defaults to 1
  logprobs?: number; // Defaults to null
  stop?: string[]; // Defaults to null
  echo?: boolean; // Defaults to false
  presence_penalty?: number; // Defaults to 0
  frequency_penalty?: number; // Defaults to 0
  best_of?: number; // Defaults to 1
  logit_bias?: any; // Defaults to null
}

export interface CompletionRequest extends CompletionParams {
  engine?: EngineID;
  prompt_prefix?: string;
  prompt_suffix?: string;
}

export interface CompletionChoice {
  text?: string;
  index?: number;
  logprobs?: any;
  finish_reason?: string;
  html?: boolean;
}

export interface CompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: CompletionChoice[];
}

export interface EngineInfo {
  id: string;
  object?: string;
  owner?: string;
  ready?: boolean;
}

export interface ListEnginesResponse {
  data?: EngineInfo[];
  object: string;
}

//
// Topic Tagging API of Twinword
//

export interface TwinwordTopicTaggingGenerateRequest {
  text: string,
}
export interface TwinwordTopicTaggingGenerateResponse {
  author: string,
  email: string,
  keyword: any, // map of "word": number of words
  result_code: string,
  result_msg: string,
  topic: any, // map of "word": score (0 ~ 1.0)
  version: string,
}

//
// Text Summarization API of TextAnalysis
//
export interface TextAnalysisTextSummarizationTextRequest {
  text?:string,
  sentnum?: number,
}
export interface TextAnalysisTextSummarizationUrlRequest {
  url?:string,
  sentnum?: number,
}
export interface TextAnalysisTextSummarizationResponse {
  sentences: Array<string>;
}

//
// Article Rewriter
//
export interface ArticleRewriterRequest {
  language?: string,
  strength?: number,
  text?: string,
  url?: string,
  rewrite ?: boolean;
}
export interface ArticleRewriterResponse {
  language: string,
  rewrite: string,
  text: string,
}

//
// Article Generator
//
export interface ArticleGeneratorRequest {
  // SERP API settings
  num_serp_results ?: number;
  num_outbound_links_per_serp_result ?: number;
  serp_google_tbs_qdr ?: string;
  serp_google_tbs_sbd ?: "1" | "0";
  serp_google_tbs ?: string;
  serp_google_tbm ?: 'isch'|'vid'|'nws'|'shop';
  // 
  seed_text ?: string; // keywords to search
  output_format ?: string; // text,markdown,html
  rewrite ?: boolean;
}
export interface ArticleGeneratorResponse {
  generated_article: string;
}


//
// Article Summarizer
//
export enum ArticleSummarizerAPIs {
  TEXT_ANALYSIS = "textanalysis",
  TEXT_MONKEY = "text-monkey",
  OPENAI = "openai",
}
export interface ArticleSummarizerRequest {
  text?: string;
  url?: string;
  api: ArticleSummarizerAPIs;
}
export interface ArticleSummarizerResponse {
  summary?: string;
}

//
// Article Extractor
//
export enum ArticleExtractorAPIs {
  TEXT_ANALYSIS = "textanalysis",
  TEXT_MONKEY = "text-monkey",
  OPENAI = "openai",
}
export interface ArticleExtractorRequest {
  text?: string; // either one of text and url must be provided
  url?: string;
  num_sentences?: number; // Number of key sentences to extract
  api: ArticleExtractorAPIs;
}
export interface ArticleExtractorResponse {
  sentences?: Array<string>;
}

//

export enum GhostWriterFullLayouts {
  simple,
  playground,
}

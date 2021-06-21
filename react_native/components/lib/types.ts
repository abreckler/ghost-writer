// Open AI - GPT 3
enum EngineID {
  Davinci = "davinci",
  Curie = "curie",
  Babbage = "babbage",
  Ada = "ada",
};

interface CompletionParams {
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

interface CompletionChoice {
  text?: string;
  index?: number;
  logprobs?: any;
  finish_reason?: string;
  html?: boolean;
}

interface CompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: CompletionChoice[];
}

interface EngineInfo {
  id: string;
  object?: string;
  owner?: string;
  ready?: boolean;
}

interface ListEnginesResponse {
  data?: EngineInfo[];
  object: string;
}

//
// Topic Tagging API of Twinword
//

interface TwinwordTopicTaggingGenerateRequest {
  text: string,
}
interface TwinwordTopicTaggingGenerateResponse {
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
interface TextAnalysisTextSummarizationTextRequest {
  text?:string,
  sentnum?: number,
}
interface TextAnalysisTextSummarizationUrlRequest {
  url?:string,
  sentnum?: number,
}
interface TextAnalysisTextSummarizationResponse {
  sentences: Array<string>;
}

//
// Article Rewriter
//
interface ArticleRewriterRequest {
  language?: string,
  strength?: number,
  text?: string,
  url?: string,
}
interface ArticleRewriterResponse {
  language: string,
  rewrite: string,
  text: string,
}

//
// Article Generator
//
interface ArticleGeneratorRequest {
  seed_text ?: string;
  output_format ?: string; // text,markdown,html
  num_serp_results ?: number;
  num_outbound_links_per_serp_result ?: number;
}
interface ArticleGeneratorResponse {
  generated_article: string;
}


export {
  //
  EngineID,
  CompletionParams,
  CompletionChoice,
  CompletionResponse,
  EngineInfo,
  ListEnginesResponse,

  //
  TwinwordTopicTaggingGenerateRequest,
  TwinwordTopicTaggingGenerateResponse,

  //
  TextAnalysisTextSummarizationTextRequest,
  TextAnalysisTextSummarizationUrlRequest,
  TextAnalysisTextSummarizationResponse,

  //
  ArticleRewriterRequest,
  ArticleRewriterResponse,

  //
  ArticleGeneratorRequest,
  ArticleGeneratorResponse
};
import {
  EngineID,
  ListEnginesResponse,
  CompletionParams,
  CompletionResponse,
  TwinwordTopicTaggingGenerateResponse,
  TwinwordTopicTaggingGenerateRequest,
  ArticleRewriterRequest,
  ArticleRewriterResponse,
  TextAnalysisTextSummarizationResponse,
  TextAnalysisTextSummarizationTextRequest,
  ArticleGeneratorResponse,
  ArticleGeneratorRequest,
} from "./types";

class MyApiClient {

  // MY_API_BASE_URL = "https://api.ghost-writer.io";
  MY_API_BASE_URL = "http://localhost:3000";
  API_KEY = "";
  DEFAULT_ENGINE : EngineID = EngineID.Curie;
  FILTER_EMPTY_COMPLETION_ANSWER = true;
  BEAUTIFY_COMPLETION_ANSWER = true;
  DEBUG = true;

  public constructor(API_KEY: string, DEFAULT_ENGINE : EngineID = EngineID.Curie) {
    this.API_KEY = API_KEY;
    this.DEFAULT_ENGINE = DEFAULT_ENGINE;
  }

  public setEngine(engine: EngineID) {
    this.DEFAULT_ENGINE = engine;
  }

  //
  // OpenAI APIs
  //

  /**
   * List engines
   * @see https://beta.openai.com/docs/api-reference/engines
   */
  public async listOpenAiEngines() : Promise<ListEnginesResponse> {
    const json = await this._doGet<ListEnginesResponse>('/openai/engines');  
    return json;
  }

  /**
   * Create completion
   * @see https://beta.openai.com/docs/api-reference/create-completion
   */
  public async completion(params: CompletionParams) : Promise<CompletionResponse> {
    const completionUrl = '/openai/engines/'+ this.DEFAULT_ENGINE +'/completions';
    const json = await this._doPost<CompletionParams, CompletionResponse>(completionUrl, params);  

    if (this.FILTER_EMPTY_COMPLETION_ANSWER)
      json.choices = (json.choices || []).filter((c) => { return !!((c.text || '').trim())});
    
    if (this.BEAUTIFY_COMPLETION_ANSWER)
      json.choices.forEach((c, i) => {
        c.finish_reason === 'length' && (c.text = c.text + '...');
      });
    
    return json;
  }


  /**
   * Run QA mode
   */
  public async runQA(params: CompletionParams) : Promise<CompletionResponse> {
    const completionUrl = '/openai/run/qa';
    const json = await this._doPost<CompletionParams, CompletionResponse>(completionUrl, params);  

    if (this.FILTER_EMPTY_COMPLETION_ANSWER)
      json.choices = (json.choices || []).filter((c) => { return !!((c.text || '').trim())});
    
    if (this.BEAUTIFY_COMPLETION_ANSWER)
      json.choices.forEach((c, i) => {
        c.text = (c.text || '').trim();
        c.finish_reason === 'length' && (c.text = c.text + '...');
      });
    
    return json;
  }

  //
  // RapidAPI - Twinword - Topic Tagging
  //
  public async generateTagging(text: string): Promise<TwinwordTopicTaggingGenerateResponse> {
    const params = {
      text: text
    } as TwinwordTopicTaggingGenerateRequest;

    return await this._doPost<TwinwordTopicTaggingGenerateRequest, TwinwordTopicTaggingGenerateResponse>('/rapidapi/twinword-topic-tagging/generate', params);
  }

  //
  //  RapidAPI - TextAnalysis - Text Summarization
  //
  public async textSummarizerText(text: string, sentnum?: number): Promise<TextAnalysisTextSummarizationResponse> {
    const params = {
      text: text,
      sentnum: sentnum ? sentnum : 5,
    } as TextAnalysisTextSummarizationTextRequest;

    return await this._doPost<TextAnalysisTextSummarizationTextRequest, TextAnalysisTextSummarizationResponse>('/rapidapi/textanalysis-text-summarization/text-summarizer-text', params);
  }

  //
  // Custom API - Article Rewriter
  //

  public async rewriteArticle(req: ArticleRewriterRequest): Promise<ArticleRewriterResponse> {
    return await this._doPost<ArticleRewriterRequest, ArticleRewriterResponse>('/api/article-rewriter/write', req);
  }

  //
  // Custom API - Article Generator
  //

  public async generateArticle(req: ArticleGeneratorRequest): Promise<ArticleGeneratorResponse> {
    return await this._doPost<ArticleGeneratorRequest, ArticleGeneratorResponse>('/api/article-generator/write', req);
  }


  //
  // Internal functions
  //

  /**
   * internal function to do POST request to OpenAI API
   */
  public async _doPost<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    const response = await fetch(this.MY_API_BASE_URL + url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'X-MyApi-Key': this.API_KEY,
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(params) // body data type must match "Content-Type" header
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do GET request to OpenAI API
   */
  public async _doGet<ResponseType>(url: string) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url);

    const response = await fetch(this.MY_API_BASE_URL + url, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      'X-MyApi-Key': this.API_KEY,
      },
    });
    const json : ResponseType = await response.json();

    if (this.DEBUG)
      console.log(json);

    return json;
  }
}

export {
  MyApiClient,
};
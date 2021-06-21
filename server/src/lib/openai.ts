import Axios, { AxiosInstance } from 'axios';

enum EngineID {
  Davinci = 'davinci',
  Curie = 'curie',
  Babbage = 'babbage',
  Ada = 'ada',
}

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

interface SearchParams {
  documents?: Array<string>;
  file?: string;
  query: string;
  max_rerank?: number;
  return_metadata?: boolean;
}

interface SearchResponseDataItem {
  document: number;
  object: string;
  score: number;
}

interface SearchResponse {
  data?: Array<SearchResponseDataItem>;
  object: string;
}

interface ClassificationParams {
  model: string;
  query: string;
  examples?: Array<Array<string>>;
  file?: string;
  labels?: Array<string>;
  search_model?: string;
  temperature?: number;
  logprobs?: number;
  max_examples?: number;
  return_prompt?: boolean;
  return_metadata?: boolean;
  expand?: boolean;
}

interface SelectedDocument {
  document: number;
  text: string;
  label?: string;
}

interface ClassificationResponse {
  completion: string;
  label: string;
  model: string;
  object: string;
  search_model: string;
  selected_examples?: Array<SelectedDocument>;
}

interface CreateAnswerParams {
  model: string;
  question: string;
  examples: Array<Array<string>>;
  examples_context: string;
  documents?: Array<string>;
  file?: string;
  search_model?: string;
  max_rerank?: number;
  temperature?: number;
  logprobs?: number;
  max_tokens?: number;
  stop?: string | Array<string>;
  n?: number;
  return_metadata?: boolean;
  return_prompt?: boolean;
  expand?: boolean;
}

interface CreateAnswerResponse {
  answers: Array<string>;
  completion: string;
  model: string;
  object: string;
  search_model: string;
  selected_documents?: Array<SelectedDocument>;
}

interface File {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string;
  format: string;
  purpose: string;
}

interface ListFilesResponse {
  data: File[];
  object: string;
}

class OpenAiApiClient {
  API_KEY = '';
  DEFAULT_ENGINE: EngineID = EngineID.Curie;
  FILTER_EMPTY_COMPLETION_ANSWER = true;
  BEAUTIFY_COMPLETION_ANSWER = true;
  DEBUG = true;

  private axios_instance: AxiosInstance;

  public constructor(API_KEY: string, DEFAULT_ENGINE: EngineID = EngineID.Curie) {
    this.API_KEY = API_KEY;
    this.DEFAULT_ENGINE = DEFAULT_ENGINE;

    this.axios_instance = Axios.create({
      baseURL: 'https://api.openai.com/v1/',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.API_KEY,
      },
    });
  }

  public setEngine(engine: EngineID) {
    this.DEFAULT_ENGINE = engine;
  }

  /**
   * List engines
   * @see https://beta.openai.com/docs/api-reference/engines
   */
  public async listEngines(): Promise<ListEnginesResponse> {
    const json = await this._doGet<ListEnginesResponse>('/engines');
    return json;
  }

  /**
   * Create completion
   * @see https://beta.openai.com/docs/api-reference/create-completion
   */
  public async completion(params: CompletionParams): Promise<CompletionResponse> {
    const completionUrl = '/engines/' + this.DEFAULT_ENGINE + '/completions';
    const json = await this._doPost<CompletionParams, CompletionResponse>(completionUrl, params);

    if (this.FILTER_EMPTY_COMPLETION_ANSWER)
      json.choices = (json.choices || []).filter((c) => {
        return !!(c.text || '').trim();
      });

    if (this.BEAUTIFY_COMPLETION_ANSWER)
      json.choices.forEach((c, i) => {
        c.finish_reason === 'length' && (c.text = c.text + '...');
      });

    return json;
  }

  /**
   * Create search
   * @see https://beta.openai.com/docs/api-reference/searches/create
   */
  public async search(params: SearchParams): Promise<SearchResponse> {
    const url = '/engines/' + this.DEFAULT_ENGINE + '/search';
    const json = await this._doPost<SearchParams, SearchResponse>(url, params);
    return json;
  }

  /**
   * Create classification
   * @see https://beta.openai.com/docs/api-reference/classifications/create
   */
  public async classification(params: ClassificationParams): Promise<ClassificationResponse> {
    const json = await this._doPost<ClassificationParams, ClassificationResponse>('/classifications', params);
    return json;
  }

  /**
   * Create answer
   * @see https://beta.openai.com/docs/api-reference/answers/create
   */
  public async createAnswer(params: CreateAnswerParams): Promise<CreateAnswerResponse> {
    const json = await this._doPost<CreateAnswerParams, CreateAnswerResponse>('/answers', params);
    return json;
  }

  /**
   * List files
   * @see https://beta.openai.com/docs/api-reference/files
   */
  public async listFiles(): Promise<ListFilesResponse> {
    const json = await this._doGet<ListFilesResponse>('/files');
    return json;
  }

  /**
   * Retrieve file
   * @see https://beta.openai.com/docs/api-reference/files/retrieve
   */
  public async retrieveFile(fileId: string): Promise<File> {
    const json = await this._doGet<File>('/files/' + fileId);
    return json;
  }

  /**
   * Delete file
   * @see https://beta.openai.com/docs/api-reference/files/delete
   */
  public async deleteFile(fileId: string): Promise<boolean> {
    const response = await this.axios_instance.delete('/files/' + fileId);
    return response.status >= 200 && response.status < 300;
  }

  /**
   * internal function to do POST request to OpenAI API
   */
  public async _doPost<ParamType, ResponseType>(url: string, params: ParamType): Promise<ResponseType> {
    if (this.DEBUG) console.log(url, params);

    const response = await this.axios_instance.post(url, params);

    const json: ResponseType = await response.data;
    if (this.DEBUG) console.log(json);

    return json;
  }

  /**
   * internal function to do GET request to OpenAI API
   */
  public async _doGet<ResponseType>(url: string): Promise<ResponseType> {
    if (this.DEBUG) console.log(url);

    const response = await this.axios_instance.get(url);

    const json: ResponseType = await response.data;
    if (this.DEBUG) console.log(json);

    return json;
  }
}

export {
  EngineID,
  CompletionParams,
  CompletionChoice,
  CompletionResponse,
  EngineInfo,
  ListEnginesResponse,
  SearchParams,
  SearchResponse,
  ClassificationParams,
  ClassificationResponse,
  CreateAnswerParams,
  CreateAnswerResponse,
  ListFilesResponse,
  OpenAiApiClient,
};

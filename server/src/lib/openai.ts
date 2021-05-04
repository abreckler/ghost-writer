enum EngineID {
  Davinci = "davinci",
    Curie = "curie",
    Babbage = "babbage",
    Ada = "ada",
};

interface CompletionParams {
  prompt ? : string;
  max_tokens ? : number; // Defaults to 16
  temperature ? : number; // Defaults to 1
  top_p ? : number; // Defaults to 1
  n ? : number; // Defaults to 1
  logprobs ? : number; // Defaults to null
  stop ? : string[]; // Defaults to null
  echo ? : boolean; // Defaults to false
  presence_penalty ? : number; // Defaults to 0
  frequency_penalty ? : number; // Defaults to 0
  best_of ? : number; // Defaults to 1
  logit_bias ? : any; // Defaults to null
}

interface CompletionChoice {
  text ? : string;
  index ? : number;
  logprobs ? : any;
  finish_reason ? : string;
}

interface CompletionResponse {
  id ? : string;
  object ? : string;
  created ? : number;
  model ? : string;
  choices: CompletionChoice[];
}

interface EngineInfo {
  id: string;
  object ? : string;
  owner ? : string;
  ready ? : boolean;
}

interface ListEnginesResponse {
  data ? : EngineInfo[];
  object: string;
}

interface SearchParams {
  documents ? : Array < string > ;
  file ? : string;
  query: string;
  max_rerank ? : number;
  return_metadata ? : boolean;
}

interface SearchResponseDataItem {
  document: number;
  object: string;
  score: number;
}

interface SearchResponse {
  data ? : Array < SearchResponseDataItem > ;
  object: string;
}

interface ClassificationParams {
  model: string;
  query: string;
  examples ? : Array < Array < string >> ;
  file ? : string;
  labels ? : Array < string > ;
  search_model ? : string;
  temperature ? : number;
  logprobs ? : number;
  max_examples ? : number;
  return_prompt ? : boolean;
  return_metadata ? : boolean;
  expand ? : boolean;
}

interface SelectedDocument {
  document: number;
  text: string;
  label ? : string;
}

interface ClassificationResponse {
  completion: string;
  label: string;
  model: string;
  object: string;
  search_model: string;
  selected_examples ? : Array < SelectedDocument > ;
}

interface CreateAnswerParams {
  model: string;
  question: string;
  examples: Array < Array < string >> ;
  examples_context: string;
  documents ? : Array < string > ;
  file ? : string;
  search_model ? : string;
  max_rerank ? : number;
  temperature ? : number;
  logprobs ? : number;
  max_tokens ? : number;
  stop ? : string | Array < string > ;
  n ? : number;
  return_metadata ? : boolean;
  return_prompt ? : boolean;
  expand ? : boolean;
}

interface CreateAnswerResponse {
  answers: Array < string > ;
  completion: string;
  model: string;
  object: string;
  search_model: string;
  selected_documents ? : Array < SelectedDocument > ;
}

interface File {
  id: string;
  object: string;
  bytes: number;
  created_at: number;
  filename: string,
  format: string;
  purpose: string
}

interface ListFilesResponse {
  data: File[];
  object: string;
}

class OpenAiApiClient {

  API_KEY = "";
  DEFAULT_ENGINE: EngineID = EngineID.Curie;
  FILTER_EMPTY_COMPLETION_ANSWER = true;
  BEAUTIFY_COMPLETION_ANSWER = true;
  DEBUG = true;

  public constructor(API_KEY: string, DEFAULT_ENGINE: EngineID = EngineID.Curie) {
    this.API_KEY = API_KEY;
    this.DEFAULT_ENGINE = DEFAULT_ENGINE;
  }

  public setEngine(engine: EngineID) {
    this.DEFAULT_ENGINE = engine;
  }

  /**
   * List engines
   * @see https://beta.openai.com/docs/api-reference/engines
   */
  public async listEngines(): Promise < ListEnginesResponse > {
    let json = await this._doGet < ListEnginesResponse > ('https://api.openai.com/v1/engines');
    return json;
  }

  /**
   * Create completion
   * @see https://beta.openai.com/docs/api-reference/create-completion
   */
  public async completion(params: CompletionParams): Promise < CompletionResponse > {
    let completionUrl = 'https://api.openai.com/v1/engines/' + this.DEFAULT_ENGINE + '/completions';
    let json = await this._doPost < CompletionParams,
      CompletionResponse > (completionUrl, params);

    if (this.FILTER_EMPTY_COMPLETION_ANSWER)
      json.choices = (json.choices || []).filter((c) => {
        return !!((c.text || '').trim())
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
  public async search(params: SearchParams): Promise < SearchResponse > {
    let url = 'https://api.openai.com/v1/engines/' + this.DEFAULT_ENGINE + '/search';
    let json = await this._doPost < SearchParams,
      SearchResponse > (url, params);
    return json;
  }


  /**
   * Create classification
   * @see https://beta.openai.com/docs/api-reference/classifications/create
   */
  public async classification(params: ClassificationParams): Promise < ClassificationResponse > {
    let json = await this._doPost < ClassificationParams,
      ClassificationResponse > ('https://api.openai.com/v1/classifications', params);
    return json;
  }

  /**
   * Create answer
   * @see https://beta.openai.com/docs/api-reference/answers/create
   */
  public async createAnswer(params: CreateAnswerParams): Promise < CreateAnswerResponse > {
    let json = await this._doPost < CreateAnswerParams,
      CreateAnswerResponse > ('https://api.openai.com/v1/answers', params);
    return json;
  }

  /**
   * List files
   * @see https://beta.openai.com/docs/api-reference/files
   */
  public async listFiles(): Promise < ListFilesResponse > {
    let json = await this._doGet < ListFilesResponse > ('https://api.openai.com/v1/files');
    return json;
  }

  /**
   * Retrieve file
   * @see https://beta.openai.com/docs/api-reference/files/retrieve
   */
  public async retrieveFile(fileId: string): Promise < File > {
    let json = await this._doGet < File > ('https://api.openai.com/v1/files/' + fileId);
    return json;
  }

  /**
   * Delete file
   * @see https://beta.openai.com/docs/api-reference/files/delete
   */
  public async deleteFile(fileId: string): Promise < boolean > {
    let response = await fetch('https://api.openai.com/v1/files/' + fileId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.API_KEY
      },
    });
    return response.ok;
  }

  /**
   * internal function to do POST request to OpenAI API
   */
  public async _doPost < ParamType, ResponseType > (url: string, params: ParamType): Promise < ResponseType > {
    if (this.DEBUG)
      console.log(url, params);

    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.API_KEY
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(params) // body data type must match "Content-Type" header
    });

    let json: ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do GET request to OpenAI API
   */
  public async _doGet < ResponseType > (url: string): Promise < ResponseType > {
    if (this.DEBUG)
      console.log(url);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.API_KEY
      },
    });

    let json: ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

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
  OpenAiApiClient
};
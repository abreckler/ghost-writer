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
  expand? : boolean;
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
  expand? : boolean;
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

  /**
   * List engines
   * @see https://beta.openai.com/docs/api-reference/engines
   */
  public async listEngines() : Promise<ListEnginesResponse> {
    let json = await this._doGet<ListEnginesResponse>('https://api.openai.com/v1/engines');  
    return json;
  }

  /**
   * Create completion
   * @see https://beta.openai.com/docs/api-reference/create-completion
   */
  public async completion(params: CompletionParams) : Promise<CompletionResponse> {
    let completionUrl = 'https://api.openai.com/v1/engines/'+ this.DEFAULT_ENGINE +'/completions';
    let json = await this._doPost<CompletionParams, CompletionResponse>(completionUrl, params);  

    if (this.FILTER_EMPTY_COMPLETION_ANSWER)
      json.choices = (json.choices || []).filter((c) => { return !!((c.text || '').trim())});
    
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
   public async search(params: SearchParams) : Promise<SearchResponse> {
    let url = 'https://api.openai.com/v1/engines/'+ this.DEFAULT_ENGINE +'/search';
    let json = await this._doPost<SearchParams, SearchResponse>(url, params);
    return json;
  }


  /**
   * Create classification
   * @see https://beta.openai.com/docs/api-reference/classifications/create
   */
   public async classification(params: ClassificationParams) : Promise<ClassificationResponse> {
    let json = await this._doPost<ClassificationParams, ClassificationResponse>('https://api.openai.com/v1/classifications', params);  
    return json;
  }

  /**
   * Create answer
   * @see https://beta.openai.com/docs/api-reference/answers/create
   */
  public async createAnswer(params: CreateAnswerParams) : Promise<CreateAnswerResponse> {
    let json = await this._doPost<CreateAnswerParams, CreateAnswerResponse>('https://api.openai.com/v1/answers', params);  
    return json;
  }

  /**
   * List files
   * @see https://beta.openai.com/docs/api-reference/files
   */
  public async listFiles() : Promise<ListFilesResponse> {
    let json = await this._doGet<ListFilesResponse>('https://api.openai.com/v1/files');
    return json;
  }

  /**
   * Retrieve file
   * @see https://beta.openai.com/docs/api-reference/files/retrieve
   */
  public async retrieveFile(fileId: string) : Promise<File> {
    let json = await this._doGet<File>('https://api.openai.com/v1/files/' + fileId);
    return json;
  }

  /**
   * Delete file
   * @see https://beta.openai.com/docs/api-reference/files/delete
   */
  public async deleteFile(fileId: string) : Promise<boolean> {
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
  public async _doPost<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
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

    let response = await fetch(url, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.API_KEY
      },
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }
}

class GhostWriterConfig {
  readonly REWRITE_TEMPLATES = [
    {
      'prompt': 'Someone wrote as: "{USER_INPUT}"' +
                '\nAnd another wrote on the same subject matter as:"',
      'stop': ['"'],
    },
  ];
  readonly QA_TEMPLATES = [
    {
      'prompt': 'Question: "{USER_INPUT}"' +
                '\nAnswer: "',
      'stop': [
        '"', 'Question:', 'Q:', // Possible separation of blocks generated by the engine.
                // The engine will analyse the seed text and generate text in similar format.
                // So there's a high probability that some distinct repetitions would occur,
                // like the starting word followed by colon(:), or other special letters.
        '.\n', // a full paragraph change,
                // Why use this?
                //   We would expect QA mode to generate single paragraph answers,
                //   not a complete article for a question.
      ],
    },
  ];
  readonly SUMMARY_TEMPLATES = [
    { // basic summary
      'prompt': '{USER_INPUT}' +
                '\ntl;dr:',
      'stop': ['\n'],
    },
    { // one-sentence summary
      'prompt': '{USER_INPUT}' +
                '\nOne-sentence summary:',
      'stop': ['\n', '.'],
    },
    { // grader summary
      'prompt': '{USER_INPUT}' +
                '\nI rephrased this for my daughter, in plain language a second grader can understand:',
      'stop': ['\n'],
    },
  ];
  readonly EXTRACT_TEMPLATES = [
    {
      'prompt': 'Someone wrote as: "{USER_INPUT}"' +
                '\nAnd another wrote on the same subject matter as:"',
      'stop': ['"'],
    },
  ];

  public generateCompleteParams(seedText: string, writingMode?: string): CompletionParams {
    let params = {} as CompletionParams;

    // NOTE: a single token is said to be approximately 4 english characters,
    // but let's give some room for variable responses by assuming it 3.
    // This way the response can be a little longer than the seed text.
    if (writingMode === 'rewrite')
    {
      const template = this.REWRITE_TEMPLATES[0];
      params.prompt = template.prompt.replaceAll('{USER_INPUT}', seedText.trim());
      params.stop = template.stop;
      params.temperature = 0.5;
      params.n = 1;
      params.frequency_penalty = 0.3;
      // rewrote text should be approximately the same length as the original text, gave 25% margin for variants
      params.max_tokens = Math.min(Math.ceil(seedText.length / 3), 1024);
    }
    // TODO: consider using "Answers" feature of OpenAI
    else if(writingMode === 'qa')
    {
      const template = this.QA_TEMPLATES[0];
      params.prompt = template.prompt.replaceAll('{USER_INPUT}', seedText.trim());
      params.stop = template.stop;
      // a single answer's length can be up to 4 times length of the seed text
      params.max_tokens = Math.min(Math.ceil(seedText.length), 1024);
      // generate N, random between 3 and 8
      let maxN = Math.floor(1024 / params.max_tokens);
      let n = Math.ceil(Math.random() * 5) + 3;
      params.n = n > maxN ? maxN : n;
    }
    else if(writingMode == 'summary' || writingMode == 'extract')
    { // generate summary or extraction
      const template = writingMode == 'summary' ? this.SUMMARY_TEMPLATES[0] : this.EXTRACT_TEMPLATES[0];
      params.prompt = template.prompt.replaceAll('{USER_INPUT}', seedText.trim());
      params.stop = template.stop;
      params.n = 1;
      params.temperature = 0.3;
      // summary/extracted text should not be longer than the original text
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    }
    else
    { // autocomplete
      params.prompt = seedText.trim();
      params.n = 1;
      // length of autocomplete text will be proportional to the original text
      params.max_tokens = Math.min(Math.ceil(seedText.length / 3), 1024);
    }

    return params;
  }
}

export { EngineID, CompletionParams, CompletionChoice, CompletionResponse, EngineInfo, ListEnginesResponse, OpenAiApiClient, GhostWriterConfig };
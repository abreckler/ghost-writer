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

interface ListEngineResponse {
  data?: EngineInfo[];
  object: string;
}

class OpenAiApiClient {

  API_KEY = "";
  DEFAULT_ENGINE = "curie";

  public constructor(API_KEY: string, DEFAULT_ENGINE="davinci") {
    this.API_KEY = API_KEY;
    this.DEFAULT_ENGINE = DEFAULT_ENGINE;
  }

  public async completion(params: CompletionParams, engine : string = '') : Promise<CompletionResponse> {
    // call OpenAI API
    // @see https://beta.openai.com/docs/api-reference/create-completion
    let response = await fetch('https://api.openai.com/v1/engines/'+ (engine || this.DEFAULT_ENGINE) +'/completions', {
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
  
    let json : CompletionResponse = await response.json();
    return json;
  }
}

class GhostWriterConfig {
  public static generateCompleteParams(seedText: string, writingMode?: string): CompletionParams {
    let params = {} as CompletionParams;

    if (writingMode === 'rewrite')
    {
      params.prompt = "The article reads:\n'''" + seedText.trim() + "'''\n\nAnd this can be rephrased as:\n'''";
      params.stop = ["'''"];
      params.temperature = 0.5;
      params.n = 1;
      params.frequency_penalty = 0.3;
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    }
    else if(writingMode === 'qa')
    {
      params.prompt = 'Q: ' + seedText.trim() + '\nA:';
      params.stop = ['Q:'];
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);

      // generate N, random between 3 and 8
      let maxN = Math.floor(1024 / params.max_tokens);
      let n = Math.ceil(Math.random() * 5) + 3;
      params.n = n > maxN ? maxN : n;
    }
    else
    { // autocomplete
      params.prompt = seedText.trim();
      params.n = 1;
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    }

    return params;
  }
}

export { CompletionParams, CompletionChoice, CompletionResponse, EngineInfo, ListEngineResponse, OpenAiApiClient, GhostWriterConfig };
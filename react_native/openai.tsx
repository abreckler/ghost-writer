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
	DEFAULT_ENGINE = "";

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

export { CompletionParams, CompletionChoice, CompletionResponse, EngineInfo, ListEngineResponse, OpenAiApiClient };
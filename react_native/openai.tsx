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

export { CompletionParams, CompletionChoice, CompletionResponse, EngineInfo, ListEngineResponse };
import { CompletionParams } from "./types";

interface CompletionParamsTemplate extends CompletionParams {
  name: string;
  }
  
  class GhostWriterConfig {
  //
  // Templates
  //
  readonly REWRITE_TEMPLATES = [
    {
    'name': 'Template 1',
    'prompt': 'A source wrote as: "{USER_INPUT}"' +
          '\nAnd another source wrote on the same subject matter as: "',
    'stop': ['"'],
    },
  ] as CompletionParamsTemplate[];
  readonly QA_TEMPLATES = [
    {
    'name': 'Template 1',
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
    {
    'name': 'Template 2',
    'prompt': 'The question is "{USER_INPUT}?"' +
          '\nAnd possible answers could be "',
    'stop': [
      '"', '.',
    ],
    },
  ] as CompletionParamsTemplate[];
  readonly SUMMARY_TEMPLATES = [
    { // basic summary
    'name': 'TL;DR;',
    'prompt': '{USER_INPUT}' +
          '\ntl;dr:',
    'stop': ['\n'],
    },
    { // one-sentence summary
    'name': 'One-sentence summary',
    'prompt': '{USER_INPUT}' +
          '\nOne-sentence summary:',
    'stop': ['\n', '.'],
    },
    { // grader summary
    'name': 'Grader summary',
    'prompt': '{USER_INPUT}' +
          '\nI rephrased this for my daughter, in plain language a second grader can understand:',
    'stop': ['\n'],
    },
  ] as CompletionParamsTemplate[];
  
  //
  //
  //
  public generateCompleteParams(seedText: string, writingMode?: string, template?: CompletionParams): CompletionParams {
    let params = {} as CompletionParams;
  
    // NOTE: a single token is said to be approximately 4 english characters,
    // but let's give some room for variable responses by assuming it 3.
    // This way the response can be a little longer than the seed text.
    if (writingMode === 'rewrite')
    {
    const template = this.REWRITE_TEMPLATES[0];
    params.prompt = (template.prompt || '').replaceAll('{USER_INPUT}', seedText.trim());
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
    const template = this.QA_TEMPLATES[1];
    params.prompt = (template.prompt || '').replaceAll('{USER_INPUT}', seedText.trim());
    params.stop = template.stop;
    // a single answer's length can be up to 4 times length of the seed text
    params.max_tokens = Math.min(Math.ceil(seedText.length), 1024);
    // generate N, random between 3 and 8
    let maxN = Math.floor(1024 / params.max_tokens);
    let n = Math.ceil(Math.random() * 5) + 3;
    params.n = n > maxN ? maxN : n;
    }
    else if(writingMode == 'summary')
    { // generate summary
    const template = this.SUMMARY_TEMPLATES[0];
    params.prompt = (template.prompt || '').replaceAll('{USER_INPUT}', seedText.trim());
    params.stop = template.stop;
    params.n = 1;
    params.temperature = 0.3;
    // summary/extracted text should not be longer than the original text
    params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    }
    else
    { // autocomplete
    if (template) {
      params.prompt = (template.prompt || '').replaceAll('{USER_INPUT}', seedText.trim());
      params.stop = template.stop;
      params.n = template.n;
      params.temperature = template.temperature;
      params.top_p = template.top_p;
      params.frequency_penalty = template.frequency_penalty;
      params.presence_penalty = template.presence_penalty;
      // summary/extracted text should not be longer than the original text
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    } else {
      params.prompt = seedText.trim();
      params.n = 1;
      // length of autocomplete text will be proportional to the original text
      params.max_tokens = Math.min(Math.ceil(seedText.length / 3), 1024);
    }
    }
  
    return params;
  }
}


export {
  GhostWriterConfig,
  CompletionParamsTemplate
};
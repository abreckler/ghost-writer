import { CompletionRequest } from "./types";

interface CompletionParamsTemplate extends CompletionRequest {
  name: string;
}
  
class GhostWriterConfig {
  //
  // Templates
  //
  readonly REWRITE_TEMPLATES = [
    {
      'name': 'Template 1',
      'prompt_prefix': 'A source wrote as: "',
      'prompt_suffix': '"\nAnd another source wrote on the same subject matter as: "',
      'stop': ['"'],
    },
  ] as CompletionParamsTemplate[];

  readonly SUMMARY_TEMPLATES = [
    { // basic summary
      'name': 'TL;DR;',
      'prompt_prefix': '',
      'prompt_suffix': '\n\ntl;dr:',
      'stop': ['\n'],
    },
    { // one-sentence summary
      'name': 'One-sentence summary',
      'prompt_prefix': '',
      'prompt_suffix': '\n\nOne-sentence summary:',
      'stop': ['\n', '.'],
    },
    { // grader summary
      'name': '2nd Grader summary',
      'prompt_prefix': '',
      'prompt_suffix': '\n\nI rephrased this for my daughter, in plain language a second grader can understand:',
      'stop': ['\n'],
    },
  ] as CompletionParamsTemplate[];
  
  //
  //
  //
  public generateCompleteParams(seedText: string, writingMode?: string, template?: CompletionRequest): CompletionRequest {
    let params = {} as CompletionRequest;
  
    // NOTE: a single token is said to be approximately 4 english characters,
    // but let's give some room for variable responses by assuming it 3.
    // This way the response can be a little longer than the seed text.
    if (writingMode === 'rewrite')
    {
      const template = this.REWRITE_TEMPLATES[0];
      params.prompt = (template.prompt_prefix || '') + seedText.trim() + (template.prompt_suffix || '');
      params.stop = template.stop;
      params.temperature = 0.5;
      params.n = 1;
      params.frequency_penalty = 0.3;
      // rewrote text should be approximately the same length as the original text, gave 25% margin for variants
      params.max_tokens = Math.min(Math.ceil(seedText.length / 3), 1024);
    }
    else if(writingMode === 'qa')
    { // QA mode
      if (template) {
        // template.prompt && (params.prompt = template.prompt.replaceAll('{USER_INPUT}', seedText.trim()));
        template.n && (params.n = template.n);
        params.prompt = (template.prompt_prefix || '') + seedText.trim() + (template.prompt_suffix || '');
      }
      else {
        params.prompt = seedText;
      }
      params.stop = [ '.\n' ];
      params.max_tokens = 1024;
    }
    else if(writingMode == 'summary')
    { // generate summary
      const template = this.SUMMARY_TEMPLATES[0];
      params.prompt = (template.prompt_prefix || '') + seedText.trim() + (template.prompt_suffix || '');
      params.stop = template.stop;
      params.n = 1;
      params.temperature = 0.3;
      // summary/extracted text should not be longer than the original text
      params.max_tokens = Math.min(Math.ceil(seedText.length / 4), 1024);
    }
    else
    { // autocomplete
      if (template) {
        params.prompt = (template.prompt_prefix || '') + seedText.trim() + (template.prompt_suffix || '');
        params.stop = template.stop && template.stop.length > 0 ? template.stop : undefined;
        params.n = template.n;
        params.max_tokens = template.max_tokens || Math.min(Math.ceil(seedText.length / 4), 1024);
        params.temperature = template.temperature;
        params.top_p = template.top_p;
        params.frequency_penalty = template.frequency_penalty;
        params.presence_penalty = template.presence_penalty;
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
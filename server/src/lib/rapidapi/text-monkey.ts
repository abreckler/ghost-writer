import RapidApiClient from './base';

//
// Text-Monkey Summarizer
// Can be used for Key sentence extraction.
// https://rapidapi.com/jhtong/api/text-monkey-summarizer/
//
interface TextMonkeySummarizeTextRequest {
  text: string;
}

interface TextMonkeySummarizeUrlRequest {
  url: string;
}

interface TextMonkeySummarizeResponse {
  snippets: Array<string>;
  summary: string;
  datePublished?: string;
  authors?: Array<string>;
  title?: string;
}

class TextMonkeySummarizerApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, 'text-monkey-summarizer.p.rapidapi.com', 'https://text-monkey-summarizer.p.rapidapi.com/nlp');
  }

  public async textSummarizerText(text: string): Promise<TextMonkeySummarizeResponse> {
    const params = {
      text: text,
    } as TextMonkeySummarizeTextRequest;

    return await this._doPostJson<TextMonkeySummarizeTextRequest, TextMonkeySummarizeResponse>('/summarize', params);
  }

  public async textSummarizerUrl(url: string): Promise<TextMonkeySummarizeResponse> {
    const params = {
      url: url,
    } as TextMonkeySummarizeUrlRequest;

    return await this._doPostJson<TextMonkeySummarizeUrlRequest, TextMonkeySummarizeResponse>('/summarize', params);
  }
}

export {
  TextMonkeySummarizerApiClient,
  TextMonkeySummarizeTextRequest,
  TextMonkeySummarizeUrlRequest,
  TextMonkeySummarizeResponse,
};

import RapidApiClient from './base';

//
// Text Summarization API of TextAnalysis
// Can be used for Key sentence extraction.
// https://rapidapi.com/textanalysis/api/text-summarization
//
interface TextAnalysisTextSummarizationTextRequest {
  text?: string;
  sentnum?: number;
}

interface TextAnalysisTextSummarizationUrlRequest {
  url?: string;
  sentnum?: number;
}

interface TextAnalysisTextSummarizationResponse {
  sentences: Array<string>;
}

class TextAnalysisTextSummarizationApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(
      API_KEY,
      'textanalysis-text-summarization.p.rapidapi.com',
      'https://textanalysis-text-summarization.p.rapidapi.com/',
    );
  }

  public async textSummarizerText(text: string, sentnum?: number): Promise<TextAnalysisTextSummarizationResponse> {
    const params = {
      text: text,
      sentnum: sentnum ? sentnum : 5,
    } as TextAnalysisTextSummarizationTextRequest;

    return await this._doPostForm<TextAnalysisTextSummarizationTextRequest, TextAnalysisTextSummarizationResponse>(
      '/text-summarizer-text',
      params,
    );
  }

  public async textSummarizerUrl(url: string, sentnum?: number): Promise<TextAnalysisTextSummarizationResponse> {
    const params = {
      url: url,
      sentnum: sentnum ? sentnum : 5,
    } as TextAnalysisTextSummarizationUrlRequest;

    return await this._doPostForm<TextAnalysisTextSummarizationUrlRequest, TextAnalysisTextSummarizationResponse>(
      '/text-summarizer-url',
      params,
    );
  }
}

export {
  TextAnalysisTextSummarizationApiClient,
  TextAnalysisTextSummarizationTextRequest,
  TextAnalysisTextSummarizationUrlRequest,
  TextAnalysisTextSummarizationResponse,
};

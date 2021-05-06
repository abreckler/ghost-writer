import RapidApiClient from './base';

//
// News Article Data Extract and Summarization by Pipfeed
// https://rapidapi.com/pipfeed-pipfeed-default/api/news-article-data-extract-and-summarization1
//
interface PipfeedArticleDataExtractorRequest {
  url?: string,
  useCache?: string,
}
interface PipfeedArticleDataExtractorResponse {
  authors: Array<string>;
  blogLogoUrl: string;
  blogName: string;
  categories: Array<string>;
  category: string;
  description: string;
  html: string;
  images:Array<string>;
  keywords: Array<string>;
  language: string;
  mainImage: string;
  predictedCategories: Array<string>;
  publishedAt: string;
  summary: string;
  tags: Array<string>;
  text: string;
  title: string;
  url: string;
}

class PipfeedArticleDataExtractorApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "news-article-data-extract-and-summarization1.p.rapidapi.com", "https://news-article-data-extract-and-summarization1.p.rapidapi.com/");
  }

  public async extractArticleData(url: string, useCache: string = 'true'): Promise<PipfeedArticleDataExtractorResponse> {
    let params = {
      url: url,
      useCache: useCache,
    };

    return await this._doGet<PipfeedArticleDataExtractorResponse>(this.API_BASEURL + 'extract/v2/?' + new URLSearchParams(params));
  }
}

export {
  PipfeedArticleDataExtractorApiClient,
  PipfeedArticleDataExtractorRequest, PipfeedArticleDataExtractorResponse,
};
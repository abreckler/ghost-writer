import RapidApiClient from './base';

//
// Rewriter/Paraphraser/Text Changer (Multi-Language) by smodin
// https://rapidapi.com/smodin/api/rewriter-paraphraser-text-changer-multi-language
//
interface SmodinRewriteRequest {
  language?: string;
  strength?: number;
  text?: string;
}
interface SmodinRewriteResponse {
  language: string;
  rewrite: string;
  text: string;
}
class SmodinRewriterApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(
      API_KEY,
      'rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com',
      'https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/',
    );
  }

  public async rewrite(text: string, lang?: string, strength?: number): Promise<SmodinRewriteResponse> {
    const params = {
      text: text,
      language: lang ? lang : 'en',
      strength: strength ? strength : 3,
    } as SmodinRewriteRequest;

    return await this._doPostJson<SmodinRewriteRequest, SmodinRewriteResponse>('/rewrite', params);
  }
}

export { SmodinRewriterApiClient, SmodinRewriteRequest, SmodinRewriteResponse };

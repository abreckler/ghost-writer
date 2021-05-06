import RapidApiClient from './base';

//
// Rewriter/Paraphraser/Text Changer (Multi-Language) by smodin
//
interface SmodinRewriteRequest {
  language?: string,
  strength?: number,
  text?: string,
}
interface SmodinRewriteResponse {
  language: string,
  rewrite: string,
  text: string,
}
class SmodinRewriterApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com", "https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/");
  }

  public async rewrite(text: string, lang?: string, strength?: number): Promise<SmodinRewriteResponse> {
    let params = {
      text: text,
      language: lang ? lang : 'en',
      strength: strength ? strength : 3,
    } as SmodinRewriteRequest;

    return await this._doPostJson<SmodinRewriteRequest, SmodinRewriteResponse>(this.API_BASEURL + 'rewrite', params);
  }
}

export {
	SmodinRewriterApiClient,
  SmodinRewriteRequest, SmodinRewriteResponse,
};
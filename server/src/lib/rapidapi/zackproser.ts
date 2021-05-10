import RapidApiClient from './base';


//
// URL Intelligence by Zackproser
// https://rapidapi.com/zackproser/api/url-intelligence
//
interface ZackproserUrlIntelligenceRequest {
  target?: string,
}
interface ZackproserUrlIntelligenceResponse {
  links: Array<string>;
  hostnames: Map<string, number>;
}

class ZackproserUrlIntelligenceApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "url-intelligence.p.rapidapi.com", "https://url-intelligence.p.rapidapi.com/");
  }

  public async rip(target: string): Promise<ZackproserUrlIntelligenceResponse> {
    let params = {
      target: target,
    };

    return await this._doGet<ZackproserUrlIntelligenceResponse>('/rip?' + new URLSearchParams(params));
  }
}

export {
  ZackproserUrlIntelligenceApiClient,
  ZackproserUrlIntelligenceRequest, ZackproserUrlIntelligenceResponse,
};
import RapidApiClient from './base';

//
// Paraphrasing Tool by Healthy Tech
// https://rapidapi.com/healthytechguy/api/paraphrasing-tool1
//
interface HealthyTechParaphraserRequest {
  sourceText?: string;
}

interface HealthyTechParaphraserResponse {
  newText: string;
}

class HealthyTechParaphraserApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, 'paraphrasing-tool1.p.rapidapi.com', 'https://paraphrasing-tool1.p.rapidapi.com/');
  }

  public async rewrite(sourceText: string): Promise<HealthyTechParaphraserResponse> {
    const params = {
      sourceText: sourceText,
    } as HealthyTechParaphraserRequest;

    return await this._doPostJson<HealthyTechParaphraserRequest, HealthyTechParaphraserResponse>(
      '/api/rewrite',
      params,
    );
  }
}

export { HealthyTechParaphraserApiClient, HealthyTechParaphraserRequest, HealthyTechParaphraserResponse };

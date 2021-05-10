import RapidApiClient from './base';

//
// Topic Tagging API of Twinword
//

interface TwinwordTopicTaggingGenerateRequest {
  text: string,
}
interface TwinwordTopicTaggingGenerateResponse {
  author: string,
  email: string,
  keyword: any, // map of "word": number of words
  result_code: string,
  result_msg: string,
  topic: any, // map of "word": score (0 ~ 1.0)
  version: string,
}

class TwinwordTopicTaggingApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "twinword-topic-tagging.p.rapidapi.com", "https://twinword-topic-tagging.p.rapidapi.com/");
  }

  public async generate(text: string): Promise<TwinwordTopicTaggingGenerateResponse> {
    let params = {
      text: text
    } as TwinwordTopicTaggingGenerateRequest;

    return await this._doPostForm<TwinwordTopicTaggingGenerateRequest, TwinwordTopicTaggingGenerateResponse>('/generate/', params);
  }
}


export {
	TwinwordTopicTaggingGenerateRequest,
	TwinwordTopicTaggingGenerateResponse,
	TwinwordTopicTaggingApiClient,
}
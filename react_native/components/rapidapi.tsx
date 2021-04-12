class RapidApiClient {

  API_KEY = "";
  API_HOST = "";
  API_BASEURL = "";
  DEBUG = !1;

  public constructor(API_KEY: string, API_HOST: string, API_BASEURL: string) {
    this.API_KEY = API_KEY;
    this.API_HOST = API_HOST;
    this.API_BASEURL = API_BASEURL;
  }

  /**
   * internal function to do POST request to RapidAPI
   */
   public async _doPostJson<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        "content-type": "application/json",
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(params), // body data type must match "Content-Type" header
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do POST request to RapidAPI
   */
  public async _doPostForm<ParamType, ResponseType>(url: string, params: ParamType) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url, params);

    let body = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      body.set(k, v);
    }

    let response = await fetch(url, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: body // body data type must match "Content-Type" header
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }

  /**
   * internal function to do GET request to OpenAI API
   */
  public async _doGet<ResponseType>(url: string) : Promise<ResponseType> {
    if (this.DEBUG)
      console.log(url);

    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.API_KEY,
        'X-RapidAPI-Host': this.API_HOST,
        'useQueryString': 'true',
      },
    });

    let json : ResponseType = await response.json();
    if (this.DEBUG)
      console.log(json);

    return json;
  }
}

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

    return await this._doPostForm<TwinwordTopicTaggingGenerateRequest, TwinwordTopicTaggingGenerateResponse>(this.API_BASEURL + 'generate/', params);
  }
}

//
// Text Summarization API of TextAnalysis
//
interface TextAnalysisTextSummarizationTextRequest {
  text?:string,
  sentnum?: number,
}
interface TextAnalysisTextSummarizationUrlRequest {
  url?:string,
  sentnum?: number,
}
interface TextAnalysisTextSummarizationResponse {
  sentences: Array<string>;
}
class TextAnalysisTextSummarizationApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, "textanalysis-text-summarization.p.rapidapi.com", "https://textanalysis-text-summarization.p.rapidapi.com/");
  }

  public async textSummarizerText(text: string, sentnum?: number): Promise<TextAnalysisTextSummarizationResponse> {
    let params = {
      text: text,
      sentnum: sentnum ? sentnum : 5,
    } as TextAnalysisTextSummarizationTextRequest;

    return await this._doPostForm<TextAnalysisTextSummarizationTextRequest, TextAnalysisTextSummarizationResponse>(this.API_BASEURL + 'text-summarizer-text', params);
  }

  public async textSummarizerUrl(url: string, sentnum?: number): Promise<TextAnalysisTextSummarizationResponse> {
    let params = {
      url: url,
      sentnum: sentnum ? sentnum : 5,
    } as TextAnalysisTextSummarizationUrlRequest;

    return await this._doPostForm<TextAnalysisTextSummarizationUrlRequest, TextAnalysisTextSummarizationResponse>(this.API_BASEURL + 'text-summarizer-url', params);
  }
}

//
// Rewriter/Paraphraser/Text Changer (Multi-Language) by smodin
//
interface SmodinRewriteRequest {
  language: string,
  strength: number,
  text: string,
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
  RapidApiClient,

  // Twinword tagging
  TwinwordTopicTaggingApiClient,
  TwinwordTopicTaggingGenerateRequest, TwinwordTopicTaggingGenerateResponse,

  // Text summarization
  TextAnalysisTextSummarizationApiClient,
  TextAnalysisTextSummarizationTextRequest, TextAnalysisTextSummarizationUrlRequest,
  TextAnalysisTextSummarizationResponse,

  // Rewriter
  SmodinRewriterApiClient,
  SmodinRewriteRequest, SmodinRewriteResponse,
};
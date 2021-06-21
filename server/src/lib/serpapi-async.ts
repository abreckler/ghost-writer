import SerpApi from 'google-search-results-nodejs';

/**
 * Override of SerpApi to use promise and 'async' feature
 */
class SerpApiSearchAsync<T_REQ extends SerpApi.SerpApiSearchParameters> extends SerpApi.SerpApiSearch<T_REQ> {
  constructor(api_key?: string, engine = 'google', timeout = 60000) {
    super(api_key, engine, timeout);
  }

  public async execute_async(path: string, parameter: T_REQ, output: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.execute(path, parameter, (data) => resolve(data), output);
    });
  }

  public async search_async(parameter: T_REQ, output: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.search(parameter, output, (data) => resolve(data));
    });
  }

  public async json_async(parameter: T_REQ): Promise<SerpApi.SerpApiSearchResult> {
    return new Promise<SerpApi.SerpApiSearchResult>((resolve, reject) => {
      this.json(parameter, (data) => resolve(data));
    });
  }

  public async html_async(parameter: T_REQ, api_key?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.html(parameter, (data) => resolve(data), api_key);
    });
  }

  public async location_async(q: string, limit: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.location(q, limit, (data) => resolve(data));
    });
  }

  public async account_async(): Promise<SerpApi.SerpApiAccountResult> {
    return new Promise<SerpApi.SerpApiAccountResult>((resolve, reject) => {
      this.account((data) => resolve(data));
    });
  }

  public async search_archive_async(search_id: string, api_key?: string): Promise<SerpApi.SerpApiSearchResult> {
    return new Promise<SerpApi.SerpApiSearchResult>((resolve, reject) => {
      this.search_archive(search_id, (data) => resolve(data), api_key);
    });
  }
}

class GoogleSearchAsync extends SerpApiSearchAsync<SerpApi.GoogleSearchParameters> {
  constructor(api_key: string) {
    super(api_key);
  }
}

export { SerpApiSearchAsync, GoogleSearchAsync };

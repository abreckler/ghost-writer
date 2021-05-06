/**
 * Self declared type file for 'google-search-results-nodejs@2.0.1'
 */
declare module 'google-search-results-nodejs' {
  class SerpApiSearch {
    constructor(api_key?: string, engine?: string, timeout?: number);

    public buildUrl(path: string, parameter: any, output: any) : string;
    public setTimeout(timeout: number) : void;
    public execute(path: string, parameter: any, callback: (data: string) => void, output: any) : void;
    public search(parameter: any, output: any, callback: (data: string) => void): void;
    public json(parameter: any, callback: (data: any) => void): void;
    public html(parameter: any, callback: (data: string) => void, api_key?: string): void;
    public location(q: string, limit: number, callback: (data: any) => void) : void;
    public account(callback: (data: any) => void) : void;
    public search_archive(search_id: string, callback: (data: any) => void, api_key? : string): void;
  }

  class GoogleSearch extends SerpApiSearch {
    constructor(api_key: string);
  }
}

/**
 * Self declared type file for 'google-search-results-nodejs@2.0.1'
 */
declare module 'google-search-results-nodejs' {
	class SerpApiSearch {
		constructor(api_key?: string, engine?: string, timeout?: number);

		buildUrl(path: string, parameter: any, output: any) : string;
		setTimeout(timeout: number) : void;
		execute(path: string, parameter: any, callback: (data: string) => void, output: any) : void;
		search(parameter: any, output: any, callback: (data: string) => void): void;
		json(parameter: any, callback: (data: any) => void): void;
		html(parameter: any, callback: (data: string) => void, api_key: string): void;
		location(q: string, limit: number, callback: (data: any) => void) : void;
		account(callback: (data: any) => void) : void;
		search_archive(search_id: string, callback: (data: any) => void, api_key? : string): void;
	}

  class GoogleSearch extends SerpApiSearch {
		constructor(api_key: string);
  }
}

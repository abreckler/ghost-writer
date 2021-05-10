/**
 * Self declared type file for 'google-search-results-nodejs@2.0.1'
 */
declare module 'google-search-results-nodejs' {
  interface SerpApiSearchParameters
  {
    engine: 'google'|'baidu'|'bing'|'yahoo'|'yandex'|'ebay'|'youtube'|'walmart'|'home_depot_product';
    device?: 'desktop' | 'tablet' | 'mobile';
    no_cache?: boolean;
    async?: boolean;
    api_key?: string;
    output?: 'json' | 'html';
  }

  interface SerpApiSearchResultSearchMetadata {
    id ?: string;
    status ?: string;
    created_at ?: string;
    processed_at ?: string;
    total_time_taken ?: number;
  }
  interface SerpApiSearchResultSearchInformation {
    total_results ?: number;
    time_taken_displayed ?: number;
    query_displayed ?: string;
  }
  interface SerpApiSearchResultSitelinks {
    inline ?: Array<{
      title ?: string;
      link ?: string;
    }>;
    expanded ?: Array<any>;
  }
  interface SerpApiSearchResultOrganicResult {
    position ?: number;
    title ?: string;
    link ?: string;
    displayed_link ?: string;
    snippet ?: string;
    sitelinks ?: SerpApiSearchResultSitelinks;
    cached_page_link ?: string;
    related_pages_link ?: string;
  }
  interface SerpApiSearchResultImageResult {
    position ?: number;
    thumbnail ?: string;
    original ?: string;
    title ?: string;
    link ?: string;
    source ?: string;
  }
  interface SerpApiSearchResultSuggestedSearch {
    name ?: string;
    link ?: string;
    chips ?: string;
    serpapi_link ?: string;
    thumbnail ?: string;
  }
  interface SerpApiSearchResultRelatedSearch {
    query ?: string;
    link ?: string;
  }
  interface SerpApiSearchResultPagination {
    current ?: number,
    prev ?: string;
    next ?: string;
    other_pages: object;
  }
  interface SerpApiSearchResultSerpApiPagination {
    current ?: number;
    next ?: string;
    next_link ?: string;
    previous_link ?: string;
    other_pages: object;
  }
  interface SerpApiSearchResultInlineImage {
    link ?: string;
    thumbnail ?: string;
  }
  interface SerpApiSearchResultRelatedQuestion {
    question ?: string;
    snippet ?: string;
    title ?: string;
    link ?: string;
  }

  interface SerpApiSearchResult {
    search_metadata ?: SerpApiSearchResultSearchMetadata;
    search_parameters ?: any;
    search_information ?: SerpApiSearchResultSearchInformation;
    pagination ?: SerpApiSearchResultPagination;
    serpapi_pagination ?: SerpApiSearchResultSerpApiPagination;
    organic_results ?: Array<SerpApiSearchResultOrganicResult>;
    images_results ?: Array<SerpApiSearchResultImageResult>;
    inline_images ?: Array<SerpApiSearchResultInlineImage>;
    inline_people_also_search_for ?: Array<any>;
    suggested_searches ?: Array<SerpApiSearchResultSuggestedSearch>;
    related_questions ?: Array<SerpApiSearchResultRelatedQuestion>;
    related_searches ?: Array<SerpApiSearchResultRelatedSearch>;
    local_results ?: Array<any>;
  }

  interface SerpApiAccountResult {
    account_id ?: string;
    api_key ?: string;
    account_email ?: string;
    plan_id ?: string;
    plan_name ?: string;
    searches_per_month ?: number;
    plan_searches_left ?: number;
    extra_credits ?: number;
    total_searches_left ?: number;
    this_month_usage ?: number;
    last_hour_searches ?: number;
    account_rate_limit_per_hour ?: number;
  }

  class SerpApiSearch <T_REQ extends SerpApiSearchParameters>
  {
    constructor(api_key?: string, engine?: string, timeout?: number);

    public buildUrl(path: string, parameter: T_REQ, output: string) : string;
    public setTimeout(timeout: number) : void;
    public execute(path: string, parameter: T_REQ, callback: (data: string) => void, output: string) : void;
    public search(parameter: T_REQ, output: string, callback: (data: string) => void): void;
    public json(parameter: T_REQ, callback: (data: SerpApiSearchResult) => void): void;
    public html(parameter: T_REQ, callback: (data: string) => void, api_key?: string): void;
    public location(q: string, limit: number, callback: (data: SerpApiSearchResult) => void) : void;
    public account(callback: (data: SerpApiAccountResult) => void) : void;
    public search_archive(search_id: string, callback: (data: SerpApiSearchResult) => void, api_key? : string): void;
  }

  interface GoogleSearchParameters extends SerpApiSearchParameters
  {
    // search query
    q: string;
    // geographic location
    location?: string;
    uule?: string;
    // localization
    google_domain?: string;
    gl?: string;
    hl?: string;
    lr?: string;
    // pagination
    start?: number;
    num?: number;
    ijn?: number;
    // search type
    tbm?: 'isch'|'vid'|'nws'|'shop';
    // advanced filters
    tbs?: string;
    safe?: 'active'|'off';
    nfpr?: 0 | 1;
    filter?: 0 | 1;
    // advanced google filters
    ludocid?: string;
    lsig?: string;
  }

  class GoogleSearch extends SerpApiSearch<GoogleSearchParameters>
  {
    constructor(api_key: string);
  }
}

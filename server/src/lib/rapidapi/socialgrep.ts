import RapidApiClient from './base';

//
// Socialgrep API
// https://rapidapi.com/lexyr-inc-lexyr-inc-default/api/socialgrep/
//
class SocialgrepQueryParams {
  // "site:{site_name}" - search only posts where the domain matches {site_name}.
  public siteName?: string;
  // "-site:{site_name}" - search only posts where the domain does not match {site_name}.
  public siteNameExclude?: string;
  // "/r/{subreddit}" - search only comments from the subreddit {subreddit}.
  public subreddit?: string;
  // "-/r/{subreddit}" - search only comments not from the subreddit {subreddit}.
  public subredditExclude?: string;
  // {term} - search only comments containing the term {term}.
  public term?: string;
  // "-{term}" - search only comments not containing the term {term}.
  public termExclude?: string;
  // "score:{score}" - search only comments with score at least {score}.
  public score?: number;
  // "before:{YYYY-mm-dd}", "after:{YYYY-mm-dd}" - search only comments within the date range. before is inclusive, after is not.
  public before?: string;
  public after?: string;
  // "post:{post_id}" - search only comments for the given post.
  public post?: string;

  public toRequestQueryParam(): string {
    const q = [];
    this.siteName && q.push(`site_name:${this.siteName}`);
    this.siteNameExclude && q.push(`-site_name:${this.siteNameExclude}`);
    this.subreddit && q.push(`/r/${this.subreddit}`);
    this.subredditExclude && q.push(`-/r/${this.subredditExclude}`);
    this.term && q.push(`${this.term}`);
    this.termExclude && q.push(`-${this.termExclude}`);
    this.score && q.push(`score:${this.score}`);
    this.before && q.push(`before:${this.before}`);
    this.after && q.push(`after:${this.after}`);
    this.post && q.push(`post:${this.post}`);

    return q.join(',');
  }
}

interface SocialgrepPostSearchRequest {
  query?: string;
  after?: string;
}

interface SocialgrepCommentSearchRequest {
  query?: string;
  after?: string;
}

interface SocialgrepSearchResponsePostItem {
  type?: string; // post
  id?: string;
  subreddit?: {
    id?: string;
    name?: string;
    nsfw?: boolean;
  };
  created_utc?: number;
  permalink?: string;
  domain?: string; // @see site_name param of query
  title?: string;
  selftext?: string;
  url?: string | null;
  score?: number;
}

interface SocialgrepSearchResponseCommentItem {
  type?: string; // comment
  id?: string;
  subreddit?: {
    id?: string;
    name?: string;
    nsfw?: boolean;
  };
  created_utc?: number;
  permalink?: string;
  body?: string;
  sentiment?: number;
}

interface SocialgrepSearchResponse<T> {
  data?: Array<T>;
  query?: string; // query param used for this search
  sort_key?: Array<number>;
}

class SocialgrepApiClient extends RapidApiClient {
  public constructor(API_KEY: string) {
    super(API_KEY, 'socialgrep.p.rapidapi.com', 'https://socialgrep.p.rapidapi.com/');
  }

  public async postSearch(
    q: SocialgrepQueryParams,
  ): Promise<SocialgrepSearchResponse<SocialgrepSearchResponsePostItem>> {
    const params = {
      query: q.toRequestQueryParam(),
    } as SocialgrepPostSearchRequest;

    return await this._doPostJson<
      SocialgrepPostSearchRequest,
      SocialgrepSearchResponse<SocialgrepSearchResponsePostItem>
    >('/search/posts', params);
  }

  public async commentSearch(
    q: SocialgrepQueryParams,
  ): Promise<SocialgrepSearchResponse<SocialgrepSearchResponseCommentItem>> {
    const params = {
      query: q.toRequestQueryParam(),
    } as SocialgrepCommentSearchRequest;

    return await this._doPostJson<
      SocialgrepCommentSearchRequest,
      SocialgrepSearchResponse<SocialgrepSearchResponseCommentItem>
    >('/search/comments', params);
  }
}

export {
  SocialgrepApiClient,
  SocialgrepQueryParams,
  SocialgrepPostSearchRequest,
  SocialgrepCommentSearchRequest,
  SocialgrepSearchResponse,
};

import { GoogleSearchParameters } from 'google-search-results-nodejs';
import { paraphraser, summarizerText } from '../../lib/composites';
import {
  SocialgrepApiClient,
  SocialgrepQueryParams,
  ZackproserUrlIntelligenceApiClient,
  ZombieBestAmazonProductsApiClient,
} from '../../lib/rapidapi';
import { GoogleSearchAsync } from '../../lib/serpapi-async';
import { breakdownRedditUrl, extractAmazonAsin, extractUrls, isAmazonDomain, isRedditDomain, parseTextFromUrl } from '../../lib/utils';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || '';

interface ArticleGeneratorConfigs {
  // SERP API params
  numSerpResults: number;
  numOutboundLinksPerSerpResult: number;
  serpGoogleTbsQdr?: string; // 'y' | 'm' | 'w' | 'd' | 'h',
  serpGoogleTbsSbd?: string; // '1' | '0', sort by date ?
  serpGoogleTbs?: string; // (to be searched) parameter defines advanced search parameters that aren't possible in the regular query field.
                          // (e.g., advanced search for patents, dates, news, videos, images, apps, or text contents).
  serpGoogleTbm?: 'isch' | 'vid' | 'nws' | 'shop'; // (to be matched) parameter defines the type of search you want to do.
  //
  outputFormat: string;
  rewrite?: boolean;
}

interface ArticleParagraph {
  source_url?: string;
  source: {
    title?: string;
    description?: string;
    summary?: string;
    tags: Array<string>;
  };
  generated: {
    title?: string;
    text?: string;
  };
  external_links: Array<string>;
}

const shoppingDomains = [
  'amzn.to',
  'www.amazon.com',
  'www.etsy.com',
  'www.target.com',
  'www.walmart.com',
  'www.ebay.com',
];

const externalLinksFilterFactory = (internalHostname: string) => {
  return (l: string, idx: number, self: Array<string>) => {
    l = l && l.trim();
    if (!l) return false;

    try {
      const u = new URL(l);
      return (
        self.indexOf(l) === idx && // uniqueness
        u.hostname &&
        u.pathname &&
        u.hostname != internalHostname && // external links only
        shoppingDomains.indexOf(u.hostname) >= 0 && // product urls only
        !/cloudflare|googleapis|aspnetcdn|ajax|api|cdn/.test(u.hostname)
      ); // avoid some common non-viewable urls
    } catch {
      return false;
    }
  };
};

interface ArticleParagraphOptions {
  includeTitle?: boolean;
  rewrite?: boolean;
}

/**
 * Generate paragraph from a Amazon Product Page as a source
 *
 * @param url - Amazon Product Page URL
 * @returns
 */
const paragraphForAmazonProduct = async (
  url: string,
  options?: ArticleParagraphOptions,
): Promise<ArticleParagraph | null> => {
  const amazonProductClient = new ZombieBestAmazonProductsApiClient(RAPIDAPI_API_KEY);

  let amazonProductResponse = null;
  try {
    let asin = extractAmazonAsin(url);
    if (!asin) {
      const asinResponse = await amazonProductClient.getASIN(url);
      if (asinResponse.error) {
        console.debug(
          'Amazon Product Get ASIN API returned invalid response, skip further processing.',
          url,
          asinResponse.error,
        );
        return null;
      } else {
        asin = asinResponse.asin;
      }
    }

    if (asin) {
      amazonProductResponse = await amazonProductClient.getProductDetails(asin);
      if (!amazonProductResponse.description) {
        console.debug('Amazon Product API returned invalid response, skip further processing.', url);
        return null;
      } else {
        let text = amazonProductResponse.description;
        if (options?.includeTitle) {
          text = amazonProductResponse.title + '\n\n\n' + text;
        }

        let rephrased;
        if (options?.rewrite === false) {
          rephrased = text;
        } else {
          rephrased = await paraphraser(text);
          if (!rephrased) return null;
        }

        return {
          source_url: url,
          source: {
            title: amazonProductResponse.title,
            description: amazonProductResponse.description,
            summary: '',
            tags: [],
          },
          generated: {
            title: amazonProductResponse.title,
            text: rephrased,
          },
          external_links: [],
        } as ArticleParagraph;
      }
    } else {
      return null;
    }
  } catch (e) {
    console.error('Amazon Product API failed with error, skip further processing.', e);
    return null;
  }
};

/**
 * METHOD 1
 *
 * 1. Google Search through SerpAPI
 * 2. Extract and summarize each result
 * 3. Extract external URLs (product links) from each result
 * 4. Rephrase each summaries
 * 5. Combine them to generate full text
 *
 * @param url {string}
 * @returns
 */
const paragraphForGeneralPages1 = async (
  url: string,
  options?: ArticleParagraphOptions,
): Promise<ArticleParagraph | null> => {
  const internalHostname = new URL(url).hostname;

  // NOTE: Pipefeed Article Data Extractor API is not active any more

  // const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
  // let extractorResponse = null;
  // try {
  //   extractorResponse = await extractorClient.extractArticleData(url);
  //   if (!extractorResponse.summary && !extractorResponse.text) {
  //     console.debug('Article Data Extraction API returned invalid response, skip further processing.', url);
  //     return null;
  //   }
  // } catch (e) {
  //   console.error('RapidAPI - Article Data Extraction API Failure, skip further processing.', e);
  //   return null;
  // }
  // var html = extractorResponse.html;
  //

  const extractorResponse = await parseTextFromUrl(url);

  const extractedUrls = extractUrls(extractorResponse.html);
  const externalLinksFilter = externalLinksFilterFactory(internalHostname);
  let externalLinks = extractedUrls.links.filter(externalLinksFilter);
  if (externalLinks.length > 0) {
    console.debug('URL Extraction Result for ' + url, extractedUrls);
  } else {
    const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);
    // if simple extraction failed, use url-intelligence api to fetch more detailed site analysis result
    try {
      const urlIntellResponse = await urlExtractorClient.rip(url);
      console.debug(
        `URL Intelligence API Result for ${url} : ${urlIntellResponse.hostnames.size} host names and ${
          (urlIntellResponse.links || []).length
        } links`,
      );
      externalLinks = urlIntellResponse.links.filter(externalLinksFilter);
    } catch (e) {
      console.error('RapidAPI - URL Intelligence API Failure: ', e);
    }
  }
  if (externalLinks.length == 0) {
    console.debug(`Could not find valid external links. yet include it in the result. ${url}`);
  }

  let rephrased;
  if (options?.rewrite === false) {
    rephrased = extractorResponse.text;
  } else {
    rephrased = await paraphraser(extractorResponse.text);
    if (!rephrased) return null;
  }

  return {
    source_url: url,
    source: {
      title: extractorResponse.title,
      description: extractorResponse.description,
      summary: extractorResponse.text,
      tags: [],
    },
    generated: {
      title: extractorResponse.title,
      text: rephrased,
    },
    external_links: externalLinks,
  } as ArticleParagraph;
};

/**
 * METHOD 2
 *
 * 1. Extract Key sentences from article text via [News Article Data Extract](https://rapidapi.com/pipfeed-pipfeed-default/api/news-article-data-extract-and-summarization1)
 * 2. Re-write the article title to use as a header for each SERP result
 * 3. Re-write the key sentences
 * 4. Combine them to generate full text
 *       {TITLE}
 *       ========
 *       {Rewritten article text}
 *       {Display outbound links (amazon only for now)}
 *       {Link to Article Source}
 *       {Tags: tags for each section}
 *       ========
 *       {Related search queries}
 *
 * @param url {string}
 * @returns
 */
const paragraphForGeneralPages2 = async (
  url: string,
  options?: ArticleParagraphOptions,
): Promise<ArticleParagraph | null> => {
  const internalHostname = new URL(url).hostname;

  // NOTE: Pipefeed Article Data Extractor API is not active any more

  // const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
  // let extractorResponse = null;
  // try {
  //   extractorResponse = await extractorClient.extractArticleData(url);
  //   if (!extractorResponse.summary && !extractorResponse.text) {
  //     console.debug('Summary Extraction API returned invalid response, skip further processing.', url);
  //     return null;
  //   }
  // } catch (e) {
  //   console.error('RapidAPI - Summary Extraction API failure, skip further processing.', e);
  //   return null;
  // }

  const extractorResponse = await parseTextFromUrl(url);

  const extractedUrls = extractUrls(extractorResponse.html);
  const externalLinksFilter = externalLinksFilterFactory(internalHostname);
  let externalLinks = extractedUrls.links.filter(externalLinksFilter);
  if (externalLinks.length > 0) {
    console.debug('URL Extraction Result for ' + url, extractedUrls);
  } else {
    // if simple extraction failed, use url-intelligence api to fetch more detailed site analysis result
    const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);
    try {
      const urlIntellResponse = await urlExtractorClient.rip(url);
      console.debug(
        `URL Intelligence API Result for ${url} : ${urlIntellResponse.hostnames.size} host names and ${
          (urlIntellResponse.links || []).length
        } links`,
      );
      externalLinks = urlIntellResponse.links.filter(externalLinksFilter);
    } catch (e) {
      console.error('RapidAPI - URL Intelligence API Failure: ', e);
    }
  }
  if (externalLinks.length == 0) {
    console.debug('could not find valid external links. yet include it in the result.', url);
  }

  let extractedText = '';
  try {
    const keySentencesResponse = await summarizerText(extractorResponse.text);
    if (!keySentencesResponse?.snippets || keySentencesResponse.snippets.length == 0) {
      console.debug('Text Summarizer API returned invalid response, skip further processing.', url);
      return null;
    }
    extractedText = keySentencesResponse?.snippets.join(' ');
  } catch (e) {
    // The Text summarizer API's availability doesn't look good.
    // Let's use article extractor/summarizer as a fallback
    console.error('Text Summarizer failure, skip further processing.', e);
    extractedText = extractorResponse.text;
  }

  let rephrased: string | undefined | null;
  if (options?.rewrite === false) {
    rephrased = extractedText;
  } else {
    rephrased = await paraphraser(extractedText);
    if (!rephrased) return null;
  }

  return {
    source_url: url,
    source: {
      title: extractorResponse.title,
      description: extractorResponse.description,
      summary: extractedText,
      tags: [],
    },
    generated: {
      title: '',
      text: rephrased,
    },
    external_links: externalLinks,
  } as ArticleParagraph;
};

/**
 * Generate paragraph from a Reddit Page as a source
 *
 * @param url - Reddit Page URL
 * @returns
 */
const paragraphForReddit = async (url: string, options?: ArticleParagraphOptions): Promise<ArticleParagraph | null> => {
  const socialgrepApiClient = new SocialgrepApiClient(RAPIDAPI_API_KEY);

  const redditUrlParts = breakdownRedditUrl(url);

  let extractedText = '';
  try {
    const socialgrepParam = new SocialgrepQueryParams();
    if (redditUrlParts.subreddit) {
      socialgrepParam.subreddit = redditUrlParts.subreddit;
    }
    if (redditUrlParts.post) {
      socialgrepParam.post = redditUrlParts.post;
    }

    // extract comments for the post, and use the comments as a source text.
    const socialgrepResponse = await socialgrepApiClient.commentSearch(socialgrepParam);
    extractedText = (socialgrepResponse.data || [])
      .map(d => {
        return '' + d.body;
      })
      .join('\n\n');
  } catch (e) {
    console.error('Reddit API failed with error, skip further processing.', e);
    return null;
  }

  const extractedTitle = (redditUrlParts.post_slug || '')
    .replace(/_/g, ' ')
    .replace(/\s(.)/g, $1 => {
      return $1.toUpperCase();
    })
    .replace(/^(.)/, $1 => {
      return $1.toUpperCase();
    });

  let rephrasedTitle: string | undefined | null;
  let rephrased: string | undefined | null;
  if (options?.rewrite === false) {
    rephrased = extractedText;
  } else {
    rephrasedTitle = await paraphraser(extractedTitle);
    const summarized = await summarizerText(extractedText);
    rephrased = summarized?.summary || summarized?.snippets?.join(' ');
    if (!rephrased) return null;
  }

  return {
    source_url: url,
    source: {
      title: extractedTitle,
      description: '',
      summary: extractedText,
      tags: [],
    },
    generated: {
      title: rephrasedTitle,
      text: rephrased,
    },
    external_links: [],
  } as ArticleParagraph;
};

/**
 * Generate paragraph from top n (3, by default) post (search on
 * google by restricting site, "site:reddit.com"),
 * 
 * @param keyword {string}
 */
const paragraphByKeyword = async (keyword: string, configs: ArticleGeneratorConfigs) => {
  const otherShoppingDomains = ['www.etsy.com', 'www.target.com', 'www.walmart.com', 'www.ebay.com'];
  const error : Array<string> = [];

  if (keyword.length < 5) {
    error.push('"seed_text" param\'s length must be longer.');
    return {
      status: 'error',
      generated_article: '',
      error: error,
    };
  }

  try {
    // call serpapi to get google search result with the seed text
    const search = new GoogleSearchAsync(SERPAPI_API_KEY);

    const searchParams = {
      engine: 'google',
      q: keyword,
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en',
    } as GoogleSearchParameters;
    if (configs.serpGoogleTbm) {
      searchParams.tbm = configs.serpGoogleTbm;
    }
    if (configs.serpGoogleTbs) {
      searchParams.tbs = configs.serpGoogleTbs;
    }

    const searchResult = await search.json_async(searchParams);
    console.debug('Google Search Request for SerpAPI', searchParams);
    console.debug(`Google Search Result from SerpAPI: ${(searchResult.organic_results || []).length} results`);

    const paragraphs: Array<ArticleParagraph> = [];

    const paragraphFromSingleUrl = async (url: string) => {
      try {
        const internalHostname = new URL(url).hostname;
        let p: ArticleParagraph | null = null;
        if (isAmazonDomain(url)) {
          p = await paragraphForAmazonProduct(url, { rewrite: configs.rewrite });
        } else if (isRedditDomain(url)) {
          p = await paragraphForReddit(url, { rewrite: configs.rewrite });
        } else if (otherShoppingDomains.indexOf(internalHostname) >= 0) {
          p = await paragraphForGeneralPages2(url, { rewrite: configs.rewrite });
        } else {
          p = await paragraphForGeneralPages2(url, { rewrite: configs.rewrite });
        }

        if (p) {
          if (p.external_links.length > configs.numOutboundLinksPerSerpResult) {
            p.external_links = p.external_links.slice(0, configs.numOutboundLinksPerSerpResult);
          }
          paragraphs.push(p);
        }
      } catch {
        console.error(`Fail to fetch paragraph for URL: ${url}`);
      }
    };

    const paragraphFetchPromises = [];
    for (let i = 0; i < (searchResult.organic_results || []).length && i < configs.numSerpResults; i++) {
      // article extraction and summarization
      const r = (searchResult.organic_results || [])[i];
      const url = r.link || '';
      if (url) {
        paragraphFetchPromises.push(paragraphFromSingleUrl(url));
      } else {
        // invalid url, skip processing
        console.debug('No valid url is found from search result, skip processing', r);
        continue;
      }
    }

    await Promise.all(paragraphFetchPromises);

    // Title generation from seed text
    let generatedTitle;
    if (configs.rewrite === false) {
      generatedTitle = keyword;
    } else {
      generatedTitle = await paraphraser(keyword.replace(/(site:[^\s]+)/g, '').trim());
    }

    // Merge paragraphs to generate full article
    let text = '';
    if (configs.outputFormat === 'text') {
      text =
        (generatedTitle ? generatedTitle + '\n\n' : '') +
        paragraphs
          .map((a) => {
            return (
              (a.generated.title ? a.generated?.title + '\n' : '') +
              a.generated?.text +
              '\n' +
              (a.external_links && a.external_links.length > 0
                ? `Found ${a.external_links.length} Link(s) in total\n` +
                  a.external_links.map((l) => '  • ' + l).join('\n') +
                  '\n'
                : '') +
              (a.source_url ? `[Source: ${a.source_url}]\n` : '') +
              (a.source.tags && a.source.tags.length > 0 ? 'Tags: ' + a.source.tags?.join(',') + '\n' : '')
            );
          })
          .join('\n') +
        '\n' +
        (searchResult.related_searches && searchResult.related_searches.length > 0
          ? 'Related searches:\n' + searchResult.related_searches.map((s) => '  - ' + s.query).join('\n') + '\n\n'
          : '') +
        (searchResult.related_questions && searchResult.related_questions.length > 0
          ? 'Related questions:\n' + searchResult.related_questions.map((q) => '  - ' + q.question).join('\n') + '\n'
          : '');
    } else if (configs.outputFormat === 'markdown') {
      text =
        (generatedTitle ? `# ${generatedTitle}  \n\n` : '') +
        paragraphs
          .map((a) => {
            return (
              (a.generated.title ? `### ${a.generated.title}\n` : '') +
              a.generated?.text?.replace('\n', '  \n') +
              '  \n' +
              (a.external_links && a.external_links.length > 0
                ? `Found ${a.external_links.length} Link(s) in total\n` +
                  a.external_links.map((l) => `  * [${l}](${l})`).join('\n') +
                  '  \n'
                : '') +
              (a.source_url ? `[Source](${a.source_url})  \n` : '') +
              (a.source.tags && a.source.tags.length > 0 ? 'Tags: ' + a.source.tags?.join(',') + '  \n' : '')
            );
          })
          .join('  \n') +
        '  \n' +
        (searchResult.related_searches && searchResult.related_searches.length > 0
          ? 'Related searches:  \n\n' + searchResult.related_searches.map((s) => '* ' + s.query).join('\n') + '  \n\n'
          : '') +
        (searchResult.related_questions && searchResult.related_questions.length > 0
          ? 'Related questions:  \n\n' +
            searchResult.related_questions.map((q) => '* ' + q.question).join('\n') +
            '  \n\n'
          : '');
    } else if (configs.outputFormat === 'html') {
      text =
        (generatedTitle ? `<h1>${generatedTitle}</h1>\n` : '') +
        paragraphs
          .map((a) => {
            return (
              (a.generated.title ? `<h3>${a.generated?.title}</h3>\n` : '') +
              '<p>' +
              a.generated?.text?.replace('\n', '<br/>') +
              '</p>\n' +
              (a.external_links && a.external_links.length > 0
                ? `<p>Found ${a.external_links.length} Link(s) in total\n` +
                  '<ul>' +
                  a.external_links.map((l) => `<li><a href="${l}">${l}</a></li>`).join('') +
                  '</ul></p><br/>\n'
                : '') +
              (a.source_url ? `<p><a href="${a.source_url}">Source</a></p>\n` : '') +
              (a.source.tags && a.source.tags.length > 0 ? '<p>Tags: ' + a.source.tags?.join(',') + '</p>\n' : '')
            );
          })
          .join('<br/>\n') +
        '<br/>' +
        (searchResult.related_searches && searchResult.related_searches.length > 0
          ? '<p>Related searches:\n' +
            '<ul>' +
            searchResult.related_searches.map((s) => '<li>' + s.query + '</li>').join('\n') +
            '</ul></p><br/><br/>\n'
          : '') +
        (searchResult.related_questions && searchResult.related_questions.length > 0
          ? '<p>Related questions:\n' +
            '<ul>' +
            searchResult.related_questions.map((q) => '<li>' + q.question + '</li>').join('\n') +
            '</ul></p><br/><br/>\n'
          : '');
    }

    return {
      status: 'success',
      generated_article: text,
      error: error,
      // 'related_searches' : searchResult.related_searches?.map(rs => rs.query),
      // 'related_queries' : searchResult.related_questions?.map(rq => rq.question),
    };
  } catch (err) {
    return {
      status: 'error',
      generated_article: null,
      error: [ '' + err ] ,
      // 'related_searches' : searchResult.related_searches?.map(rs => rs.query),
      // 'related_queries' : searchResult.related_questions?.map(rq => rq.question),
    };
  }
};

export {
  ArticleGeneratorConfigs,
  ArticleParagraph,
  paragraphForAmazonProduct,
  paragraphForGeneralPages1,
  paragraphForGeneralPages2,
  paragraphForReddit,
  paragraphByKeyword,
};

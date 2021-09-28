import { paraphraser, summarizerText } from '../../lib/composites';
import {
  SocialgrepApiClient,
  SocialgrepQueryParams,
  ZackproserUrlIntelligenceApiClient,
  ZombieBestAmazonProductsApiClient,
} from '../../lib/rapidapi';
import { breakdownRedditUrl, extractAmazonAsin, extractUrls, parseTextFromUrl } from '../../lib/utils';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';
interface ArticleGeneratorConfigs {
  // SERP API params
  numSerpResults: number;
  numOutboundLinksPerSerpResult: number;
  serpGoogleTbsQdr?: string; // 'y' | 'm' | 'w' | 'd' | 'h',
  serpGoogleTbsSbd?: string; // '1' | '0', sort by date ?
  serpGoogleTbs?: string;
  serpGoogleTbm?: 'isch' | 'vid' | 'nws' | 'shop';
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
    const socialgrepResponse = await socialgrepApiClient.commentSearch(socialgrepParam);
    extractedText = (socialgrepResponse.data || [])
      .map(function (d) {
        return '' + d;
      })
      .join('\n\n');
  } catch (e) {
    console.error('Reddit API failed with error, skip further processing.', e);
    return null;
  }

  const extractedTitle = (redditUrlParts.post_slug || '')
    .replace(/_/g, ' ')
    .replace(/\s(.)/g, function ($1) {
      return $1.toUpperCase();
    })
    .replace(/^(.)/, function ($1) {
      return $1.toUpperCase();
    });

  let rephrasedTitle: string | undefined | null;
  let rephrased: string | undefined | null;
  if (options?.rewrite === false) {
    rephrased = extractedText;
  } else {
    rephrasedTitle = await paraphraser(extractedTitle);
    rephrased = await paraphraser(extractedText);
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

export {
  ArticleGeneratorConfigs,
  ArticleParagraph,
  paragraphForAmazonProduct,
  paragraphForGeneralPages1,
  paragraphForGeneralPages2,
  paragraphForReddit,
};

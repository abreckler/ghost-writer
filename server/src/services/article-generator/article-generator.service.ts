import {
  HealthyTechParaphraserApiClient,
  PipfeedArticleDataExtractorApiClient,
  SmodinRewriterApiClient,
  TextAnalysisTextSummarizationApiClient,
  ZackproserUrlIntelligenceApiClient,
  ZombieBestAmazonProductsApiClient,
} from '../../lib/rapidapi';
import { extractUrls } from '../../lib/utils';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';

interface ArticleGeneratorConfigs {
  numSerpResults: number;
  numOutboundLinksPerSerpResult: number;
  outputFormat: string;
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

const paraphraser = async (text: string, apiName: 'smodin' | 'healthytech' = 'smodin'): Promise<string | null> => {
  switch (apiName) {
    case 'healthytech':
      try {
        const rephraserClient = new HealthyTechParaphraserApiClient(RAPIDAPI_API_KEY);
        const rephraserRespone = await rephraserClient.rewrite(text);
        if (rephraserRespone.newText) {
          return rephraserRespone.newText;
        } else {
          console.debug('Rephrasing API returned invalid response, skip further processing.', text);
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Rephraser API Failure: ', e);
        return null;
      }
    case 'smodin':
      try {
        const rephraserClient = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
        const rephraserRespone = await rephraserClient.rewrite(text, 'en', 3);
        if (rephraserRespone.rewrite) {
          return rephraserRespone.rewrite;
        } else {
          console.debug(
            'Rewriter/Paraphraser/Text Changer API returned invalid response, skip further processing.',
            text,
          );
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Rephraser API Failure: ', e);
        return null;
      }
  }
};

interface AmazonProductArticleOptions {
  includeTitle?: boolean;
}

/**
 * Generate paragraph from a Amazon Product Page as a source
 *
 * @param url - Amazon Product Page URL
 * @returns
 */
const paragraphForAmazonProduct = async (
  url: string,
  options?: AmazonProductArticleOptions,
): Promise<ArticleParagraph | null> => {
  const amazonProductClient = new ZombieBestAmazonProductsApiClient(RAPIDAPI_API_KEY);

  let amazonProductResponse = null;
  try {
    const asinResponse = await amazonProductClient.getASIN(url);
    if (asinResponse.error) {
      console.debug(
        'Amazon Product Get ASIN API returned invalid response, skip further processing.',
        url,
        asinResponse.error,
      );
      return null;
    } else {
      amazonProductResponse = await amazonProductClient.getProductDetails(asinResponse.asin);
      if (!amazonProductResponse.description) {
        console.debug('Amazon Product API returned invalid response, skip further processing.', url);
        return null;
      } else {
        let text = amazonProductResponse.description;
        if (options?.includeTitle) {
          text = amazonProductResponse.title + '\n\n\n' + text;
        }
        const rephrased = await paraphraser(text);
        if (!rephrased) return null;

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
const paragraphForGeneralPages1 = async (url: string): Promise<ArticleParagraph | null> => {
  const internalHostname = new URL(url).hostname;
  const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
  const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);

  let extractorResponse = null;
  try {
    extractorResponse = await extractorClient.extractArticleData(url);
    if (!extractorResponse.summary && !extractorResponse.text) {
      console.debug('Article Data Extraction API returned invalid response, skip further processing.', url);
      return null;
    }
  } catch (e) {
    console.error('RapidAPI - Article Data Extraction API Failure, skip further processing.', e);
    return null;
  }

  const extractedUrls = extractUrls(extractorResponse.html);
  const externalLinksFilter = externalLinksFilterFactory(internalHostname);
  let externalLinks = extractedUrls.links.filter(externalLinksFilter);
  if (externalLinks.length > 0) {
    console.debug('URL Extraction Result for ' + url, extractedUrls);
  } else {
    // if simple extraction failed, use url-intelligence api to fetch more detailed site analysis result
    try {
      const urlIntellResponse = await urlExtractorClient.rip(url);
      console.debug('URL Intelligence API Result for ' + url, urlIntellResponse);
      externalLinks = urlIntellResponse.links.filter(externalLinksFilter);
    } catch (e) {
      console.error('RapidAPI - URL Intelligence API Failure: ', e);
    }
  }
  if (externalLinks.length == 0) {
    console.debug('could not find valid external links. yet include it in the result.', url);
  }

  const rephrased = await paraphraser(extractorResponse.summary || extractorResponse.text);
  if (!rephrased) return null;

  return {
    source_url: url,
    source: {
      title: extractorResponse.title,
      description: extractorResponse.description,
      summary: extractorResponse.summary || extractorResponse.text,
      tags: extractorResponse.tags || [],
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
const paragraphForGeneralPages2 = async (url: string): Promise<ArticleParagraph | null> => {
  const internalHostname = new URL(url).hostname;
  const keySentenceExtractorClient = new TextAnalysisTextSummarizationApiClient(RAPIDAPI_API_KEY);
  const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
  const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);

  let extractorResponse = null;
  try {
    extractorResponse = await extractorClient.extractArticleData(url);
    if (!extractorResponse.summary && !extractorResponse.text) {
      console.debug('Summary Extraction API returned invalid response, skip further processing.', url);
      return null;
    }
  } catch (e) {
    console.error('RapidAPI - Summary Extraction API failure, skip further processing.', e);
    return null;
  }

  const extractedUrls = extractUrls(extractorResponse.html);
  const externalLinksFilter = externalLinksFilterFactory(internalHostname);
  let externalLinks = extractedUrls.links.filter(externalLinksFilter);
  if (externalLinks.length > 0) {
    console.debug('URL Extraction Result for ' + url, extractedUrls);
  } else {
    // if simple extraction failed, use url-intelligence api to fetch more detailed site analysis result
    try {
      const urlIntellResponse = await urlExtractorClient.rip(url);
      console.debug('URL Intelligence API Result for ' + url, urlIntellResponse);
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
    const keySentencesResponse = await keySentenceExtractorClient.textSummarizerText(extractorResponse.text);
    if (!keySentencesResponse.sentences || keySentencesResponse.sentences.length == 0) {
      console.debug('Key sentence extraction API returned invalid response, skip further processing.', url);
      return null;
    }
    extractedText = keySentencesResponse.sentences.join(' ');
  } catch (e) {
    // The Text summarizer API's availability doesn't look good.
    // Let's use article extractor/summarizer as a fallback
    console.error('RapidAPI - Key sentence extraction API failure, skip further processing.', e);
    extractedText = extractorResponse.summary || extractorResponse.text;
  }

  const rephrased = await paraphraser(extractedText);
  if (!rephrased) return null;

  return {
    source_url: url,
    source: {
      title: extractorResponse.title,
      description: extractorResponse.description,
      summary: extractedText,
      tags: extractorResponse.tags || [],
    },
    generated: {
      title: '',
      text: rephrased,
    },
    external_links: externalLinks,
  } as ArticleParagraph;
};

export {
  ArticleGeneratorConfigs,
  ArticleParagraph,
  paraphraser,
  paragraphForAmazonProduct,
  paragraphForGeneralPages1,
  paragraphForGeneralPages2,
};

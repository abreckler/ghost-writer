import { Request, Response, NextFunction } from 'express';
import {
  ArticleGeneratorConfigs,
  paragraphByKeyword,
} from './article-generator.service';


/**
 *
 * @param req.body.seed_text {string}
 * @param req.body.output_format {'text'|'markdown'|'html'}
 * @param req.body.num_serp_results {number?} - DEFAULT 3.
 * @param req.body.num_outbound_links_per_serp_result {number?} - DEFAULT 3.
 * @param req.body.rewrite {boolean?} - DEFAULT true.
 */
const writeProductsReviewArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const seedText = req.body.seed_text || '';
  const configs = {
    numSerpResults: req.body.num_serp_results || 3,
    numOutboundLinksPerSerpResult: req.body.num_outbound_links_per_serp_result || 3,
    serpGoogleTbsQdr: req.body.serp_google_tbs_qdr || undefined,
    serpGoogleTbsSbd: req.body.serp_google_tbs_sbd || undefined,
    serpGoogleTbs: req.body.serp_google_tbs || undefined,
    serpGoogleTbm: req.body.serp_google_tbm || undefined,
    outputFormat: req.body.output_format || 'text',
    rewrite: req.body.rewrite === false ? false : true, // rewrite param's default value is true
  } as ArticleGeneratorConfigs;

  const error = [];

  if (seedText.length < 5) {
    error.push('"seed_text" param\'s length must be longer.');
    res.json({
      generated_article: '',
      error: error,
    });
    return;
  }

  if (configs.numSerpResults > 10) {
    error.push('"num_serp_results" param can not exceed 10. It is defaulted to 3');
    configs.numSerpResults = 3;
  } else if (configs.numSerpResults <= 0) {
    error.push('"num_serp_results" param must be greater than 0. It is defaulted to 3');
    configs.numSerpResults = 3;
  }

  if (configs.numOutboundLinksPerSerpResult > 10) {
    error.push('"num_outbound_links_per_serp_result" param can not exceed 10. It is defaulted to 3');
    configs.numOutboundLinksPerSerpResult = 3;
  } else if (configs.numOutboundLinksPerSerpResult <= 0) {
    error.push('"num_outbound_links_per_serp_result" param must be greater than 0. It is defaulted to 3');
    configs.numOutboundLinksPerSerpResult = 3;
  }

  const tbsParams = [];
  if (configs.serpGoogleTbsQdr) {
    tbsParams.push('qdr:' + configs.serpGoogleTbsQdr);
  }
  if (configs.serpGoogleTbsSbd == '1') {
    if (!configs.serpGoogleTbsQdr) {
      tbsParams.push('qdr:all');
    }
    tbsParams.push('sbd:1');
  }
  if (!configs.serpGoogleTbs && tbsParams.length > 0) {
    configs.serpGoogleTbs = tbsParams.join(',');
  }

  const result = await paragraphByKeyword(seedText, configs);

  if (result.status == 'success') {
    res.json({
      generated_article: result.generated_article,
      error: result.error,
      params: {
        num_serp_results: configs.numSerpResults,
        num_outbound_links_per_serp_result: configs.numOutboundLinksPerSerpResult,
      },
    });
  }
  else {
    next(result.error);
  }
};


/**
 * Paragraphs should be taken from the summarization of the top 3 reddit search results of the past 30 days
 * for the given keyword , e.g: site:reddit.com best greek islands
 * 
 * @param req.body.keywords {string[]}
 * @param req.body.site {string} - limit site, like reddit.com
 * @param req.body.output_format {'text'|'markdown'|'html'}
 * @param req.body.num_serp_results {number?} - DEFAULT 3.
 * @param req.body.num_outbound_links_per_serp_result {number?} - DEFAULT 3.
 * @param req.body.serp_google_tbs_qdr {'y' | 'm' | 'w' | 'd' | 'h'}
 * @param req.body.rewrite {boolean?} - DEFAULT true.
 */
const writeArticleByKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const keywords = req.body.keywords || [];
  const site = req.body.site;
  const error = [];
  const configs = {
    numSerpResults: req.body.num_serp_results || 3,
    numOutboundLinksPerSerpResult: req.body.num_outbound_links_per_serp_result || 3,
    serpGoogleTbsQdr: req.body.serp_google_tbs_qdr || undefined,
    serpGoogleTbsSbd: req.body.serp_google_tbs_sbd || undefined,
    serpGoogleTbs: req.body.serp_google_tbs || undefined,
    serpGoogleTbm: req.body.serp_google_tbm || undefined,
    outputFormat: req.body.output_format || 'markdown',
    rewrite: req.body.rewrite === false ? false : true, // rewrite param's default value is true
    appendRelatedSearches: false,
    appendRelatedQuestions: false,
  } as ArticleGeneratorConfigs;

  if (!Array.isArray(keywords) || keywords.length <= 0) {
    error.push('Missing Parameter: "keywords"!');
    res.json({
      generated_article: '',
      error: error,
    });
    return;
  }

  if (configs.numSerpResults > 10) {
    error.push('"num_serp_results" param can not exceed 10. It is defaulted to 3');
    configs.numSerpResults = 3;
  } else if (configs.numSerpResults <= 0) {
    error.push('"num_serp_results" param must be greater than 0. It is defaulted to 3');
    configs.numSerpResults = 3;
  }

  const tbsParams = [];
  if (configs.serpGoogleTbsQdr) {
    tbsParams.push('qdr:' + configs.serpGoogleTbsQdr);
  }
  if (configs.serpGoogleTbsSbd == '1') {
    if (!configs.serpGoogleTbsQdr) {
      tbsParams.push('qdr:all');
    }
    tbsParams.push('sbd:1');
  }
  if (!configs.serpGoogleTbs && tbsParams.length > 0) {
    configs.serpGoogleTbs = tbsParams.join(',');
  }

  try {
    const generatorPromises : Array<Promise<any>> = [];
    const usedUrls: Array<string> = [];
    keywords.forEach((k: string) => {
      generatorPromises.push(paragraphByKeyword((site ? `site:${site} ` : '') + k, configs, usedUrls));
    });

    const searchResults = await Promise.all(generatorPromises);

    const result = {
      generated_article: '',
      error: [],
      params: {
        num_serp_results: configs.numSerpResults,
        num_outbound_links_per_serp_result: configs.numOutboundLinksPerSerpResult,
      },
    };

    searchResults.forEach((value, index, array) => {
      if (value.status == 'success') {
        result.generated_article += (result.generated_article ? '\n\n' : '') + value.generated_article;
      }
      else if(value.error) {
        result.error = result.error.concat(value.error);
      }
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};


export { writeProductsReviewArticle, writeArticleByKeywords };

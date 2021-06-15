import { Request, Response, NextFunction } from 'express';
import { GoogleSearchAsync } from '../../lib/serpapi-async';
import { GoogleSearchParameters } from 'google-search-results-nodejs';
import {
  ArticleGeneratorConfigs,
  ArticleParagraph,
  paragraphForAmazonProduct,
  paragraphForGeneralPages2,
  paraphraser,
} from './article-generator.service';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || '';

/**
 *
 * @param req.body.seed_text {string}
 * @param req.body.output_format {'text'|'markdown'|'html'}
 * @param req.body.num_serp_results {number?} - DEFAULT 3.
 * @param req.body.num_outbound_links_per_serp_result {number?} - DEFAULT 3.
 */
const writeProductsReviewArticle = async (req: Request, res: Response, next: NextFunction) => {
  const seedText = req.body.seed_text || '';
  const configs = {
    numSerpResults: req.body.num_serp_results || 3,
    numOutboundLinksPerSerpResult: req.body.num_outbound_links_per_serp_result || 3,
    outputFormat: req.body.output_format || 'text',
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

  try {
    // call serpapi to get google search result with the seed text
    const search = new GoogleSearchAsync(SERPAPI_API_KEY);
    const searchParams = {
      engine: 'google',
      q: seedText,
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en',
    } as GoogleSearchParameters;
    const searchResult = await search.json_async(searchParams);
    console.debug('Google Search Result from SerpAPI', searchResult);

    const paragraphs: Array<ArticleParagraph> = [];

    for (let i = 0; i < (searchResult.organic_results || []).length && i < configs.numSerpResults; i++) {
      // article extraction and summarization
      const r = (searchResult.organic_results || [])[i];
      const url = r.link || '';
      if (url) {
        const internalHostname = new URL(url).hostname;
        if (['amzn.to', 'www.amazon.com'].indexOf(internalHostname) >= 0) {
          const p = await paragraphForAmazonProduct(url);
          p && paragraphs.push(p);
        } else if (
          ['www.etsy.com', 'www.target.com', 'www.walmart.com', 'www.ebay.com'].indexOf(internalHostname) >= 0
        ) {
        } else {
          const p = await paragraphForGeneralPages2(url);
          p && paragraphs.push(p);
        }
      } else {
        // invalid url, skip processing
        console.debug('No valid url is found from search result, skip processing', r);
        continue;
      }
    }

    paragraphs.forEach((p, i, ary) => {
      if (p.external_links.length > configs.numOutboundLinksPerSerpResult)
        ary[i].external_links = p.external_links.slice(0, configs.numOutboundLinksPerSerpResult);
    });

    // Title generation from seed text
    const generatedTitle = await paraphraser(seedText.replace(/(site:[^\s]+)/g, '').trim());

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

    res.json({
      generated_article: text,
      error: error,
      params: {
        num_serp_results: configs.numSerpResults,
        num_outbound_links_per_serp_result: configs.numOutboundLinksPerSerpResult,
      },
      // 'related_searches' : searchResult.related_searches?.map(rs => rs.query),
      // 'related_queries' : searchResult.related_questions?.map(rq => rq.question),
    });
  } catch (err) {
    next(err);
  }
};

export { writeProductsReviewArticle };

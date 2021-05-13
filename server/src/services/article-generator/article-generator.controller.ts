import { Request, Response, NextFunction } from 'express';
import { GoogleSearchAsync } from '../../lib/serpapi-async';

import {
  PipfeedArticleDataExtractorApiClient,
  HealthyTechParaphraserApiClient,
  ZackproserUrlIntelligenceApiClient,
} from "../../lib/rapidapi";
import { GoogleSearchParameters } from 'google-search-results-nodejs';
import { extractUrls } from '../../lib/utils';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || '';

/**
 * 
 * @param req.body.seed_text {string}
 */
const writeArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seedText = req.body.seed_text || '';
    // call serpapi to get google search result with the seed text
    const search = new GoogleSearchAsync(SERPAPI_API_KEY);
    const searchParams = {
      engine: "google",
      q: seedText,
      location: "Austin, Texas, United States",
      google_domain: "google.com",
      gl: "us",
      hl: "en"
    } as GoogleSearchParameters;
    const searchResult = await search.json_async(searchParams);
    console.log('Google Search Result from SerpAPI', searchResult);

    // extract top results
    const MAX_SOURCE_ARTICLES = 3;
    const extractedArticles = [];
    const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
    const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);
    const rephraserClient = new HealthyTechParaphraserApiClient(RAPIDAPI_API_KEY);

    let j = 0;
    for (let i = 0; i < (searchResult.organic_results || []).length && j < MAX_SOURCE_ARTICLES; i++)
    {
      // article extraction and summarization
      const r = (searchResult.organic_results || [])[i];
      const url = r.link || '';
      if (url)
      {
        let extractorResponse = await extractorClient.extractArticleData(url);
        console.log('Article Extraction Result for ' + url, extractorResponse);

        let extractedUrls = extractUrls(extractorResponse.html);
        const internalHostname = new URL(url).hostname;
        const externalLinksFilter = (l: string, idx: number, self: Array<string>) => {
          try {
            let u = new URL(l);
            return self.indexOf(l) === idx // uniqueness
                && u.hostname && u.pathname && u.hostname != internalHostname // external links only
                && ['amzn.to', 'www.amazon.com', 'www.etsy.com', ].indexOf(u.hostname) >= 0 // product urls only
                && !/cloudflare|googleapis|aspnetcdn|ajax|api|cdn/.test(u.hostname) // avoid some common non-viewable urls
          } catch {
            return false;
          }
        };
        let externalLinks = extractedUrls.links.filter(externalLinksFilter);
        if (externalLinks.length == 0)
        {
          let urlIntellResponse = await urlExtractorClient.rip(url);
          console.log('URL Intelligence API Result for ' + url, urlIntellResponse);
          externalLinks = urlIntellResponse.links.filter(externalLinksFilter);
        }
        else
        {
          console.log('URL Extraction Result for ' + url, extractedUrls);
        }

        if (externalLinks.length > 0)
        {
          let rephraserRespone = await rephraserClient.rewrite(extractorResponse.summary);
          extractedArticles.push({
            source_url: url,
            title: extractorResponse.title,
            description: extractorResponse.description,
            summary: extractorResponse.summary,
            rephrased_summary: rephraserRespone.newText,
            external_links: externalLinks,
          });
          j++;
        }
      }
    }

    console.log('Extracted Articles', extractedArticles);

    // merge article summaries to generate full text
    // const text = extractedArticles.map(a => {
    //   return '<p>' + a.rephrased_summary.replace('\n', '<br/>') + '</p>' +
    //     '<a href="' + a.source_url + '">Source</a><br/>' +
    //     '<p>Links: <ul>' + a.external_links.map(l => `<li><a href="${l}">${l}</a></li>`).join('') + '</ul></p>'
    // }).join('<br/><br/>');
    const text = extractedArticles.map(a => {
      return a.rephrased_summary + '\n\n' +
        'Source: ' + a.source_url + '\n' +
        'Links: Total ' + a.external_links.length + ' Links\n' + a.external_links.map(l => '  • ' + l).join('\n')
    }).join('\n\n');

    res.json({
      'generated_article' : text
    });
  } catch (err) {
    next(err);
  }
}

export {
  writeArticle,
}
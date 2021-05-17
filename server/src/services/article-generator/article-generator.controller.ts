import { Request, Response, NextFunction } from 'express';
import { GoogleSearchAsync } from '../../lib/serpapi-async';

import {
  PipfeedArticleDataExtractorApiClient,
  HealthyTechParaphraserApiClient,
  ZackproserUrlIntelligenceApiClient,
  HealthyTechParaphraserResponse,
} from "../../lib/rapidapi";
import { GoogleSearchParameters } from 'google-search-results-nodejs';
import { extractUrls } from '../../lib/utils';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || '';

/**
 * 
 * @param req.body.seed_text {string}
 * @param req.body.num_serp_results {number?} - DEFAULT 3.
 * @param req.body.num_outbound_links_per_serp_result {number?} - DEFAULT 3.
 */
const writeProductsReviewArticle = async (req: Request, res: Response, next: NextFunction) => {
  const seedText = req.body.seed_text || '';
  let numSerpResults = req.body.num_serp_results || 3;
  let numOutboundLinksPerSerpResult = req.body.num_outbound_links_per_serp_result || 3;
  const error = [];

  if (seedText.length < 5) {
    error.push('"seed_text" param\'s length must be longer.');
    res.json({
      'generated_article' : '',
      'error': error,
    });
    return;
  }

  if (numSerpResults > 20){
    error.push('"num_serp_results" param can not exceed 20. It is defaulted to 3');
    numSerpResults = 3;
  } else if (numSerpResults <= 0){
    error.push('"num_serp_results" param must be greater than 0. It is defaulted to 3');
    numSerpResults = 3;
  }

  if (numOutboundLinksPerSerpResult > 10){
    error.push('"num_outbound_links_per_serp_result" param can not exceed 10. It is defaulted to 3');
    numOutboundLinksPerSerpResult = 3;
  } else if (numOutboundLinksPerSerpResult <= 0){
    error.push('"num_outbound_links_per_serp_result" param must be greater than 0. It is defaulted to 3');
    numOutboundLinksPerSerpResult = 3;
  }

  try {
    // call serpapi to get google search result with the seed text
    const search = new GoogleSearchAsync(SERPAPI_API_KEY);
    const searchParams = {
      engine: "google",
      q: seedText,
      google_domain: "google.com",
      gl: "us",
      hl: "en",
    } as GoogleSearchParameters;
    const searchResult = await search.json_async(searchParams);
    console.log('Google Search Result from SerpAPI', searchResult);

    // extract top results
    const extractedArticles = [];
    const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
    const urlExtractorClient = new ZackproserUrlIntelligenceApiClient(RAPIDAPI_API_KEY);
    const rephraserClient = new HealthyTechParaphraserApiClient(RAPIDAPI_API_KEY);

    let j = 0;
    for (let i = 0; i < (searchResult.organic_results || []).length && i < numSerpResults; i++)
    {
      // article extraction and summarization
      const r = (searchResult.organic_results || [])[i];
      const url = r.link || '';
      if (!url)
      {
        // invalid url, skip processing
        console.log("No valid url is found from search result, skip processing", r);
        continue;
      }

      const internalHostname = new URL(url).hostname;
      if (['amzn.to', 'www.amazon.com', 'www.etsy.com', ].indexOf(internalHostname) >= 0)
      {
        // if the url is the direct link to the Product item page of Amazon, Etsy, etc., skip it for now.
        // TODO: we may need to find a way to process this
        continue;
      }

      let extractorResponse = null;
      try {
        extractorResponse = await extractorClient.extractArticleData(url);
        if (!extractorResponse.summary)
        {
          console.log("Summary extraction API returned invalid response, skip further processing.", url);
          continue;
        }
      } catch {
        console.log("Summary extraction failed due to API failure, skip further processing.", url);
        continue;
      }

      let extractedUrls = extractUrls(extractorResponse.html);
      const externalLinksFilter = (l: string, idx: number, self: Array<string>) => {
        l = l && l.trim();
        if (!l)
          return false;

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
      if (externalLinks.length > 0)
      {
        console.log('URL Extraction Result for ' + url, extractedUrls);
      }
      else
      {
        // if simple extraction failed, use url-intelligence api to fetch more detailed site analysis result
        try {
          let urlIntellResponse = await urlExtractorClient.rip(url);
          console.log('URL Intelligence API Result for ' + url, urlIntellResponse);
          externalLinks = urlIntellResponse.links.filter(externalLinksFilter);
        } catch {
          console.log('URL Intelligence API Failure: ', url);
        }
      }

      if (externalLinks.length == 0) {
        console.log("could not find valid external links. skip further processing.", url);
        continue;
      }

      let rephraserRespone : HealthyTechParaphraserResponse | undefined = undefined;
      try {
        rephraserRespone = await rephraserClient.rewrite(extractorResponse.summary);
        if (!rephraserRespone.newText) {
          console.log("Rephrasing API returned invalid response, skip further processing.", extractorResponse.summary);
          continue;
        }
      } catch {
        console.log('Rephraser API Failure: ', extractorResponse.summary);
        continue;
      }
      
      extractedArticles.push({
        source_url: url,
        title: extractorResponse.title,
        description: extractorResponse.description,
        summary: extractorResponse.summary,
        rephrased_summary: rephraserRespone?.newText,
        external_links: externalLinks,
      });
      j++;
    }

    // merge article summaries to generate full text
    // const text = extractedArticles.map(a => {
    //   return '<p>' + a.rephrased_summary.replace('\n', '<br/>') + '</p>' +
    //     '<a href="' + a.source_url + '">Source</a><br/>' +
    //     '<p>Links: <ul>' + a.external_links.map(l => `<li><a href="${l}">${l}</a></li>`).join('') + '</ul></p>'
    // }).join('<br/><br/>');
    const text = extractedArticles.map(a => {
      return a.rephrased_summary + '\n\n' +
        'Source: ' + a.source_url + '\n' +
        'Links: Total ' + a.external_links.length + ' Links\n' +
        a.external_links.slice(0, numOutboundLinksPerSerpResult).map(l => '  • ' + l).join('\n')
    }).join('\n\n');

    res.json({
      'generated_article' : text,
      'error': error,
      'params': {
        'num_serp_results': numSerpResults,
        'num_outbound_links_per_serp_result': numOutboundLinksPerSerpResult,
      }
    });
  } catch (err) {
    next(err);
  }
}

export {
  writeProductsReviewArticle,
}
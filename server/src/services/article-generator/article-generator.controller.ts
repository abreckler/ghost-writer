import { Request, Response, NextFunction } from 'express';
import { GoogleSearchAsync } from '../../lib/serpapi-async';

import {
  PipfeedArticleDataExtractorApiClient,
  PipfeedArticleDataExtractorResponse,
  HealthyTechParaphraserApiClient,
  HealthyTechParaphraserResponse,
} from "../../lib/rapidapi";
import { GoogleSearchParameters } from 'google-search-results-nodejs';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || '';

const writeArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // call serpapi to get google search result with the seed text
    const search = new GoogleSearchAsync(SERPAPI_API_KEY);
    const searchParams = {
      engine: "google",
      q: "gifts for people who drive a lot after:2021-04-08",
      location: "Austin, Texas, United States",
      google_domain: "google.com",
      gl: "us",
      hl: "en"
    } as GoogleSearchParameters;
    const searchResult = await search.json_async(searchParams);

    // extract top results
    const extractedArticles = [];
    for (let i = 0; i < (searchResult.organic_results || []).length; i++)
    {
      // article extraction and summarization
      const r = (searchResult.organic_results || [])[i];
      const url = r.link || '';
      if (url)
      {
        const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
        const extractorResponse = await extractorClient.extractArticleData(url);
        extractedArticles.push(extractorResponse.summary);
      }
    }

    // merge article summaries to generate full text
    // rephrase
    const sourceText = extractedArticles.join('\n\n');;
    const rephraserClient = new HealthyTechParaphraserApiClient(RAPIDAPI_API_KEY);
    const rephraserRespone = await rephraserClient.rewrite(sourceText);

    res.json({
      'generated_article' : rephraserRespone.newText
    });
  } catch (err) {
    next(err);
  }
}

export {
  writeArticle,
}
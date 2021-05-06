import { Request, Response, NextFunction } from 'express';
import { GoogleSearchAsync } from '../../lib/serpapi-async';

import {
  PipfeedArticleDataExtractorApiClient,
  PipfeedArticleDataExtractorRequest, PipfeedArticleDataExtractorResponse,
  HealthyTechParaphraserApiClient,
  HealthyTechParaphraserRequest, HealthyTechParaphraserResponse,
} from "../../lib/rapidapi";

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
    };
    const searchResult = await search.json_async(searchParams);

    // extract top results

    // article extraction and summarization

    // rephrase

    
  } catch (err) {
    next(err);
  }
}

export {
  writeArticle,
}
import { Request, Response, NextFunction } from 'express';
import SerpApi from 'google-search-results-nodejs';

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
    const search = new SerpApi.GoogleSearch(SERPAPI_API_KEY);

    // article extraction and summarization

    // rephrase

    
  } catch (err) {
    next(err);
  }
}

export {
  writeArticle,
}
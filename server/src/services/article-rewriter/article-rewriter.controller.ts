import { Request, Response, NextFunction } from 'express';
import { PipfeedArticleDataExtractorApiClient, SmodinRewriterApiClient } from '../../lib/rapidapi';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';

interface RewriteArticleRequest {
  text?: string;
  url?: string;
}

/**
 *
 * @param req.body {SmodinRewriteRequest}
 */
const rewriteArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as RewriteArticleRequest;
    let text = '';
    if (params.url) {
      const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
      const extractorResponse = await extractorClient.extractArticleData(params.url);
      text = extractorResponse.text || extractorResponse.summary;
    } else if (params.text) {
      text = params.text;
    }

    if (text) {
      const client = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
      const response = await client.rewrite(text || '', 'en', 3);
      res.status(200).json(response);
    } else {
      throw new Error('Invalid argument');
    }
  } catch (err) {
    console.error('RapidAPI - Text Rewrite API by Smodin failed with error', err);
    next(err);
  }
};

export { rewriteArticle };

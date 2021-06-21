import { Request, Response, NextFunction } from 'express';
import { SmodinRewriterApiClient } from '../../lib/rapidapi';

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

    if (params.url) {
    } else if (params.text) {
      const client = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
      const response = await client.rewrite(params.text || '', 'en', 3);
      res.status(200).json(response);
    }
  } catch (err) {
    console.error('RapidAPI - Text Rewrite API by Smodin failed with error', err);
    next(err);
  }
};

export { rewriteArticle };

import { Request, Response, NextFunction } from 'express';
import {
  SmodinRewriteRequest,
  SmodinRewriterApiClient,
} from '../../lib/rapidapi';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';


/**
 *
 * @param req.body {SmodinRewriteRequest}
 */
 const rewriteText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as SmodinRewriteRequest;
    const client = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
    const response = await client.rewrite(params.text || '', params.language, params.strength);
    res.status(200).json(response);
  } catch (err) {
    console.error('RapidAPI - Text Rewrite API by Smodin failed with error', err);
    next(err);
  }
};

export { rewriteText };

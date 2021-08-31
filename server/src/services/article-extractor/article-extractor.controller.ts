import { Request, Response, NextFunction } from 'express';
import { summarizerText, summarizerUrl } from '../../lib/composites';

interface ExtractArticleRequest {
  text?: string; // either one of text and url must be provided
  url?: string;
  num_sentences?: number; // Number of key sentences to extract
  api?: 'textanalysis' | 'text-monkey' | 'openai';
}

interface ExtractArticleResponse {
  sentences?: Array<string>;
}

/**
 *
 * @param req.body {ExtractArticleRequest}
 */
const extractArticle = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const params = req.body as ExtractArticleRequest;

    if (params.url) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerUrl(params.url, null, params.api);
        res.status(200).json({
          sentences: summarizerResponse?.snippets || [],
        } as ExtractArticleResponse);
      }
    } else if (params.text) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerText(params.text, null, params.api);
        res.status(200).json({
          sentences: summarizerResponse?.snippets || [],
        } as ExtractArticleResponse);
      }
    }
  } catch (err) {
    console.error('Text Summarizer failed with error', err);
    next(err);
  }
};

export { extractArticle };

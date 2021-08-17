import { Request, Response, NextFunction } from 'express';
import { summarizerText, summarizerUrl } from '../../lib/composites';

interface SummarizeArticleRequest {
  // basic params
  // either one of text and url must be provided
  text?: string;
  url?: string;
  mode?: 'summary' | 'key-sentences';
  api?: 'textanalysis' | 'text-monkey' | 'openai';

  // optional params for each different modes
  num_sentences?: number; // Number of key sentences to extract
}

/**
 *
 * @param req.body {RewriteArticleRequest}
 */
const summarizeArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as SummarizeArticleRequest;

    if (params.url) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerUrl(params.url, null, params.api);
        res.status(200).json({
          snippets: summarizerResponse?.snippets,
          summary: summarizerResponse?.summary,
        });
      }
    } else if (params.text) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerText(params.text, null, params.api);
        res.status(200).json({
          snippets: summarizerResponse?.snippets,
          summary: summarizerResponse?.summary,
        });
      }
    }
  } catch (err) {
    console.error('Text Summarizer failed with error', err);
    next(err);
  }
};

export { summarizeArticle };

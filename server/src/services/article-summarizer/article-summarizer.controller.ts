import { Request, Response, NextFunction } from 'express';
import { summarizerText, summarizerUrl } from '../../lib/composites';

interface SummarizeArticleRequest {
  // basic params
  // either one of text and url must be provided
  text?: string;
  url?: string;
  api?: 'textanalysis' | 'text-monkey' | 'openai';
}

interface SummarizeArticleResponse {
  // basic params
  // either one of text and url must be provided
  summary?: string;
}

/**
 *
 * @param req.body {SummarizeArticleRequest}
 */
const summarizeArticle = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const params = req.body as SummarizeArticleRequest;

    if (params.url) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerUrl(params.url, null, params.api);
        res.status(200).json({
          summary: summarizerResponse?.summary || (summarizerResponse?.snippets || []).join(' ').trim(),
        } as SummarizeArticleResponse);
      }
    } else if (params.text) {
      if (params.api === 'openai') {
        //
      } else {
        const summarizerResponse = await summarizerText(params.text, null, params.api);
        res.status(200).json({
          summary: summarizerResponse?.summary || (summarizerResponse?.snippets || []).join(' ').trim(),
        } as SummarizeArticleResponse);
      }
    }
  } catch (err) {
    console.error('Text Summarizer failed with error', err);
    next(err);
  }
};

export { summarizeArticle };

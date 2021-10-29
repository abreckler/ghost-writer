import { Request, Response, NextFunction } from 'express';
import { summarizerText, summarizerUrl } from '../../lib/composites';
import { isRedditDomain } from '../../lib/utils';
import { paragraphForReddit } from '../article-generator/article-generator.service';

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

    if (params.url && isRedditDomain(params.url)) {
      // for reddit url, we will extract post/comments and summarize them.
      const redditText = await paragraphForReddit(params.url, { rewrite: false });
      params.text = redditText?.generated.text;
      params.url = undefined;
    }

    if (params.url) {
      const summarizerResponse = await summarizerUrl(params.url, null, params.api);
      res.status(200).json({
        summary: summarizerResponse?.summary || (summarizerResponse?.snippets || []).join(' ').trim(),
      } as SummarizeArticleResponse);
    } else if (params.text) {
      const summarizerResponse = await summarizerText(params.text, null, params.api);
      res.status(200).json({
        summary: summarizerResponse?.summary || (summarizerResponse?.snippets || []).join(' ').trim(),
      } as SummarizeArticleResponse);
    }
  } catch (err) {
    console.error('Text Summarizer failed with error', err);
    next(err);
  }
};

export { summarizeArticle };

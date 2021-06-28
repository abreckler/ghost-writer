import { Request, Response, NextFunction } from 'express';
import { PipfeedArticleDataExtractorApiClient, SmodinRewriterApiClient } from '../../lib/rapidapi';
import { splitText } from '../../lib/utils';
import { htmlToText, HtmlToTextOptions } from 'html-to-text';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';

interface RewriteArticleRequest {
  text?: string;
  url?: string;
}

/**
 *
 * @param req.body {RewriteArticleRequest}
 */
const rewriteArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as RewriteArticleRequest;
    let text = '';
    if (params.url) {
      const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
      const extractorResponse = await extractorClient.extractArticleData(params.url);
      if (extractorResponse.html) {
        // use html-to-text to extract text with paragraphs
        const htmlToTextOptions = {
          wordwrap: 80, // null for no-wrap
          ignoreHref: false,
          ignoreImage: false,
          singleNewLineParagraphs: false,
        } as HtmlToTextOptions;
        text = htmlToText(extractorResponse.html, htmlToTextOptions);
      }
      if (!text) {
        // if we can't use html-to-text, fallback to the raw text or the summary (NOTE: this text does not have paragraphs)
        text = extractorResponse.text || extractorResponse.summary;
      }
      if (extractorResponse.title) {
        text = extractorResponse.title + '\n\n\n' + text;
      }
    } else if (params.text) {
      text = params.text;
    }

    if (text) {
      const client = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
      const texts = splitText(text, 9999); // Smodin API restricts input length to 10000
      const para = [];
      for (let i = 0; i < texts.length; i++) {
        const response = await client.rewrite(texts[i], 'en', 3);
        para.push(response.rewrite);
      }
      res.status(200).json({
        language: 'en',
        rewrite: para.join('\n'),
        text: text,
      });
    } else {
      throw new Error('Invalid argument');
    }
  } catch (err) {
    console.error('RapidAPI - Text Rewrite API by Smodin failed with error', err);
    next(err);
  }
};

export { rewriteArticle };

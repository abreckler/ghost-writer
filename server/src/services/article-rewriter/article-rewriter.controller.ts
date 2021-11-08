import { Request, Response, NextFunction } from 'express';
import { paraphraser } from '../../lib/composites';
import { isAmazonDomain, parseTextFromUrl, splitText, isRedditDomain, logError } from '../../lib/utils';
import { paragraphForAmazonProduct, paragraphForReddit } from '../article-generator/article-generator.service';

interface RewriteArticleRequest {
  text?: string;
  url?: string;
  rewrite?: boolean;
}

/**
 *
 * @param req.body {RewriteArticleRequest}
 */
const rewriteArticle = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const params = req.body as RewriteArticleRequest;
    params.rewrite = params.rewrite === false ? false : true; // rewrite param's default value is true

    let text = '';
    if (params.url && isAmazonDomain(params.url)) {
      // Amazon Product URL
      const para = await paragraphForAmazonProduct(params.url, { includeTitle: true, rewrite: params.rewrite });
      res.status(200).json({
        language: 'en',
        rewrite: para?.generated?.text,
        url: params.url,
        text: (para?.source?.title ? para?.source?.title + '\n\n\n' : '') + para?.source?.description,
      });
      return;
    } else if (params.url && isRedditDomain(params.url)) {
      // Reddit URL
      const para = await paragraphForReddit(params.url, { includeTitle: true, rewrite: params.rewrite });
      res.status(200).json({
        language: 'en',
        rewrite: para?.generated?.text,
        url: params.url,
        text: (para?.source?.title ? para?.source?.title + '\n\n\n' : '') + para?.source?.description,
      });
      return;
    } else if (params.url) {
      // NOTE: Pipefeed Article Data Extractor API is not active any more

      // Rewrite an article from a URL
      // const extractorClient = new PipfeedArticleDataExtractorApiClient(RAPIDAPI_API_KEY);
      // const extractorResponse = await extractorClient.extractArticleData(params.url);
      // if (extractorResponse.html) {
      //   // use html-to-text to extract text with paragraphs
      //   const htmlToTextOptions = {
      //     wordwrap: 80, // null for no-wrap
      //     ignoreHref: false,
      //     ignoreImage: false,
      //     singleNewLineParagraphs: false,
      //   } as HtmlToTextOptions;
      //   text = htmlToText(extractorResponse.html, htmlToTextOptions);
      // }
      // if (!text) {
      //   // if we can't use html-to-text, fallback to the raw text or the summary (NOTE: this text does not have paragraphs)
      //   text = extractorResponse.text || extractorResponse.summary;
      // }
      // if (extractorResponse.title) {
      //   text = extractorResponse.title + '\n\n\n' + text;
      // }
      const extractorResponse = await parseTextFromUrl(params.url);
      text = extractorResponse.text;
    } else if (params.text) {
      // Rewrite a text
      text = params.text;
    }

    if (!text) {
      throw new Error('Could not get the text to rewrite');
    }

    if (params.rewrite === false) {
      // No rewrite?
      res.status(200).json({
        language: 'en',
        rewrite: text,
        text: text,
        url: params.url,
      });
    } else {
      const texts = splitText(text, 9999); // Smodin API restricts input length to 10000
      const para = [];
      for (let i = 0; i < texts.length; i++) {
        // if "rewrite" param is set, rewrite the paragraph
        para.push(await paraphraser(texts[i]));
      }
      res.status(200).json({
        language: 'en',
        rewrite: para.join('\n'),
        text: text,
        url: params.url,
      });
    }
  } catch (err) {
    logError('Article Rewriter failed with error', err);
    next(err);
  }
};

export { rewriteArticle };

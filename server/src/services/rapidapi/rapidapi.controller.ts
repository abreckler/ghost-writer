import { Request, Response, NextFunction } from 'express';
import {
  TwinwordTopicTaggingGenerateRequest,
  TwinwordTopicTaggingApiClient,
  SmodinRewriteRequest,
  SmodinRewriterApiClient,
  TextAnalysisTextSummarizationTextRequest,
  TextAnalysisTextSummarizationApiClient,
} from '../../lib/rapidapi';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';

/**
 *
 * @param req.body {TwinwordTopicTaggingGenerateRequest}
 */
const generateTagging = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as TwinwordTopicTaggingGenerateRequest;
    const client = new TwinwordTopicTaggingApiClient(RAPIDAPI_API_KEY);
    const response = await client.generate(params.text);
    res.status(200).json(response);
  } catch (err) {
    console.error('RapidAPI - Topic Tagging API by Twinword failed with error', err);
    next(err);
  }
};

/**
 *
 * @param req.body {TextAnalysisTextSummarizationTextRequest}
 */
const summarizeText = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as TextAnalysisTextSummarizationTextRequest;
    const client = new TextAnalysisTextSummarizationApiClient(RAPIDAPI_API_KEY);
    const response = await client.textSummarizerText(params.text || '');
    res.status(200).json(response);
  } catch (err) {
    console.error('RapidAPI - Text Summarization API by TextAnalysis failed with error', err);
    next(err);
  }
};

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

export { generateTagging, summarizeText, rewriteText };

import { Request, Response, NextFunction } from 'express';
import { exit } from 'process';
import {
  OpenAiApiClient,
  EngineID,
  CompletionParams,
  SearchParams,
  ClassificationParams,
  CreateAnswerParams,
} from '../../lib/openai';
import { logError, responseWithError } from '../../lib/utils';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

//
// Simple proxy mode
//

const listEngines = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const client = new OpenAiApiClient(OPENAI_API_KEY);
    const response = await client.listEngines();
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Listing Engines API failed with error', err);
    next(err);
  }
};

/**
 *
 * @param req.body {CompletionParams}
 * @param req.params.engine {string}
 */
const completion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const engine = req.params.engine as EngineID;
    const params = req.body as CompletionParams;
    const client = new OpenAiApiClient(OPENAI_API_KEY, engine);

    if (!params.prompt || params.prompt.trim() == '') {
      responseWithError(res, 400, 'Empty prompt text');
      return;
    }

    if (!params.max_tokens) {
      // GPT-3 Engines supports up to 2048 tokens per request (prompt text + completion text)
      params.max_tokens = 2048 - (params.prompt || '').length / 4;
    }

    if (params.max_tokens <= 0) {
      responseWithError(res, 400, 'Invalid max token. Note that the GPT-3 engine supports up to 2048 tokens per request (prompt text + completion text). Try reduce the length of prompt text or completion text');
      return;
    }

    const response = await client.completion(params);
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Text Completion API failed with error', err);
    next(err);
  }
};

/**
 *
 * @param req.body {SearchParams}
 * @param req.params.engine {string}
 */
const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const engine = req.params.engine as EngineID;
    const params = req.body as SearchParams;
    const client = new OpenAiApiClient(OPENAI_API_KEY, engine);
    const response = await client.search(params);
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Search API failed with error', err);
    next(err);
  }
};

/**
 *
 * @param req.body {ClassificationParams}
 * @param req.params.engine {string}
 */
const classification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const engine = req.params.engine as EngineID;
    const params = req.body as ClassificationParams;
    const client = new OpenAiApiClient(OPENAI_API_KEY, engine);
    const response = await client.classification(params);
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Classification API failed with error', err);
    next(err);
  }
};

/**
 *
 * @param req.body {CreateAnswerParams}
 * @param req.params.engine {string}
 */
const createAnswer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const engine = req.params.engine as EngineID;
    const params = req.body as CreateAnswerParams;
    const client = new OpenAiApiClient(OPENAI_API_KEY, engine);
    const response = await client.createAnswer(params);
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Create Answer API failed with error', err);
    next(err);
  }
};

const listFiles = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const client = new OpenAiApiClient(OPENAI_API_KEY);
    const response = await client.listFiles();
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - List Files API failed with error', err);
    next(err);
  }
};

//
// custom modes
//

/**
 * Q&A mode
 * Uses instruct engines
 */
const runQA = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.body as CompletionParams;
    const client = new OpenAiApiClient(OPENAI_API_KEY, EngineID.CurieInstruct);
    const response = await client.completion(params);
    res.status(200).json(response);
  } catch (err) {
    logError('OpenAI(a.k.a. GPT-3) - Text Completion API failed with error', err);
    next(err);
  }
};

export { listEngines, completion, search, classification, createAnswer, listFiles, runQA };

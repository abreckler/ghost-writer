import { Request, Response, NextFunction } from 'express';
import {
  OpenAiApiClient,
  EngineID,
  CompletionParams,
  SearchParams,
  ClassificationParams,
  CreateAnswerParams,
} from "../../lib/openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const listEngines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = new OpenAiApiClient(OPENAI_API_KEY);
    const response = await client.listEngines();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

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
    const response = await client.completion(params);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

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
    next(err);
  }
}

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
    next(err);
  }
}

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
    next(err);
  }
}

const listFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = new OpenAiApiClient(OPENAI_API_KEY);
    const response = await client.listFiles();
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}


export {
  listEngines,
  completion,
  search,
  classification,
  createAnswer,
  listFiles,
}
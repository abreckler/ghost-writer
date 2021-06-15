import express from 'express';
import middleware from '../../middleware';
import { listEngines, completion, search, classification, createAnswer, listFiles } from './openai.controller';

export const openaiRouter = express.Router();

openaiRouter.get('/engines', middleware.authentication, middleware.authorization('a role GET / HEAD'), listEngines);
openaiRouter.post(
  '/engines/:engine/completions',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  completion,
);
openaiRouter.post(
  '/engines/:engine/search',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  search,
);
openaiRouter.post(
  '/classifications/create',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  classification,
);
openaiRouter.post(
  '/answers/create',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  createAnswer,
);
openaiRouter.get('/files', middleware.authentication, middleware.authorization('a role GET / HEAD'), listFiles);

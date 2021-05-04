import express from "express";
import versionRouter from '../../lib/versionRouter';
import {
  listEngines,
  completion,
  search,
  classification,
  createAnswer,
  listFiles
} from "./openai.controller";

export const openaiRouter = express.Router();

const listAllEnginesVersions = new Map().set('v1', listEngines);
const createCompletionVersions = new Map().set('v1', completion);
const searchVersions = new Map().set('v1', search);
const classificationVersions = new Map().set('v1', classification);
const createAnswerVersions = new Map().set('v1', createAnswer);
const listFilesVersions = new Map().set('v1', listFiles);

openaiRouter.get('/engines', versionRouter(listAllEnginesVersions));
openaiRouter.post('/engines/:engine/completions', versionRouter(createCompletionVersions));
openaiRouter.post('/engines/:engine/search', versionRouter(searchVersions));
openaiRouter.post('/classifications/create', versionRouter(classificationVersions));
openaiRouter.post('/answers/create', versionRouter(createAnswerVersions));
openaiRouter.get('/files', versionRouter(listFilesVersions));

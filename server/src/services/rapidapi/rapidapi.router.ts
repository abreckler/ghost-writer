import express from "express";
import middleware from '../../middleware';
import {
  generateTagging,
  summarizeText,
  rewriteText,
} from "./rapidapi.controller";

export const rapidapiRouter = express.Router();

rapidapiRouter.get('/twinword-topic-tagging/generate',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'), 
  generateTagging);
rapidapiRouter.post('/textanalysis-text-summarization/text-summarizer-text',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'), 
  summarizeText);
rapidapiRouter.post('/rewriter-paraphraser-text-changer-multi-language/rewrite',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'), 
  rewriteText);

import express from 'express';
import middleware from '../../middleware';
import { extractArticle } from './article-extractor.controller';

export const articleExtractorRouter = express.Router();

articleExtractorRouter.post(
  '/article-extractor/key-sentences',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  extractArticle,
);

import express from 'express';
import middleware from '../../middleware';
import { writeProductsReviewArticle, writeArticleByKeywords } from './article-generator.controller';

export const articleGeneratorRouter = express.Router();

articleGeneratorRouter.post(
  '/article-generator/write',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  writeProductsReviewArticle,
);

articleGeneratorRouter.post(
  '/article-generator/write_by_keywords',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  writeArticleByKeywords,
);

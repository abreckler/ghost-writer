import express from 'express';
import middleware from '../../middleware';
import { writeProductsReviewArticle } from './article-rewriter.controller';

export const articleGeneratorRouter = express.Router();

articleGeneratorRouter.post(
  '/article-generator/write',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  writeProductsReviewArticle,
);

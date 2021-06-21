import express from 'express';
import middleware from '../../middleware';
import { rewriteArticle } from './article-rewriter.controller';

export const articleRewriterRouter = express.Router();

articleRewriterRouter.post(
  '/article-rewriter/write',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  rewriteArticle,
);

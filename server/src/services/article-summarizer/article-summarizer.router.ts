import express from 'express';
import middleware from '../../middleware';
import { summarizeArticle } from './article-summarizer.controller';

export const articleSummarizerRouter = express.Router();

articleSummarizerRouter.post(
  '/article-summarizer/write',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  summarizeArticle,
);

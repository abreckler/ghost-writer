import express from 'express';
import middleware from '../../middleware';
import { generateTagging } from './rapidapi.controller';

export const rapidapiRouter = express.Router();

rapidapiRouter.post(
  '/twinword-topic-tagging/generate',
  middleware.authentication,
  middleware.authorization('a role GET / HEAD'),
  generateTagging,
);

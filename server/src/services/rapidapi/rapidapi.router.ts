import express from "express";
import {
  generateTagging,
  summarizeText,
  rewriteText,
} from "./rapidapi.controller";

export const rapidapiRouter = express.Router();

rapidapiRouter.get('/twinword-topic-tagging/generate', generateTagging);
rapidapiRouter.post('/textanalysis-text-summarization/text-summarizer-text', summarizeText);
rapidapiRouter.post('/rewriter-paraphraser-text-changer-multi-language/rewrite', rewriteText);

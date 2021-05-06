import express from "express";
import {
  writeArticle,
} from "./article-generator.controller";

export const articleGeneratorRouter = express.Router();

articleGeneratorRouter.post('/article-generator/write', writeArticle);

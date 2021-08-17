import { pingz } from '../../pingz/pingz.swagger';
import { openai } from '../../openai/openai.swagger';
import { rapidapi } from '../../rapidapi/rapidapi.swagger';
import { articleExtractor, ArticleExtractorResponseSchema } from '../../article-extractor/article-extractor.swagger';
import { articleGenerator, ArticleGeneratorResponseSchema } from '../../article-generator/article-generator.swagger';
import { articleRewriter, ArticleRewriterResponseSchema } from '../../article-rewriter/article-rewriter.swagger';
import {
  articleSummarizer,
  ArticleSummarizerResponseSchema,
} from '../../article-summarizer/article-summarizer.swagger';
import { servers, info, securitySchemes } from './common';
import { Pingz, UnknownYet } from './common/schemas';

export const swaggerDocument = {
  openapi: '3.0.1',
  info: { ...info, version: '1.0' },
  servers,
  components: {
    schemas: {
      Pingz,
      ArticleExtractorResponse: ArticleExtractorResponseSchema,
      ArticleGeneratorResponse: ArticleGeneratorResponseSchema,
      ArticleRewriterResponse: ArticleRewriterResponseSchema,
      ArticleSummarizerResponse: ArticleSummarizerResponseSchema,
      UnknownYet,
    },
  },
  securitySchemes,
  tags: [],
  paths: {
    ...pingz,
    ...openai,
    ...rapidapi,
    ...articleExtractor,
    ...articleGenerator,
    ...articleRewriter,
    ...articleSummarizer,
  },
};

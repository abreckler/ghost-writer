import { pingz } from '../../pingz/pingz.swagger';
import { notes } from '../../notes/notes.swagger';
import { openai } from '../../openai/openai.swagger';
import { rapidapi } from '../../rapidapi/rapidapi.swagger';
import { articleGenerator, articleGeneratorResponseSchema } from '../../article-generator/article-generator.swagger';
import { articleRewriter, articleRewriterResponseSchema } from '../../article-rewriter/article-rewriter.swagger';
import { servers, info, securitySchemes } from './common';
import { Pingz, Note } from './common/schemas';

export const swaggerDocument = {
  openapi: '3.0.1',
  info: { ...info, version: '1.0' },
  servers,
  components: {
    schemas: {
      Pingz,
      Note,
      articleGeneratorResponseSchema,
      articleRewriterResponseSchema,
    },
  },
  securitySchemes,
  tags: [],
  paths: {
    ...pingz,
    ...notes,
    ...openai,
    ...rapidapi,
    ...articleGenerator,
    ...articleRewriter,
  },
};

import { acceptVersion } from '../apiDocs/swaggerDocs/common';

export const infoBlock = {
  tags: ['rewriter'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Article Rewriter API',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const articleRewriterResponseSchema = {
  properties: {
    text: {
      type: 'string',
      example: 'x-wing',
    },
  },
};

export const articleRewriter = {
  '/api/article-rewriter/write': {
    post: {
      ...infoBlock,
      description: 'Rewrite an article',
      parameters: [
        acceptVersion,
        {
          name: 'text',
          in: 'params',
          description: 'Input text',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Rewritten Article',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/articleRewriterResponseSchema',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

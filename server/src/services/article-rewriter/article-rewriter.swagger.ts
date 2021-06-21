export const infoBlock = {
  tags: ['Article Rewriter'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Article Rewriter API',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const ArticleRewriterResponseSchema = {
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
        {
          name: 'text',
          in: 'params',
          description: 'Source article text to rewrite',
          required: false,
          schema: {
            type: 'string',
            example: 'Source article text to rewrite',
          },
        },
        {
          name: 'url',
          in: 'params',
          description: 'Source article url to rewrite',
          required: false,
          schema: {
            type: 'string',
            example: 'https://example.com/article-url',
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
                $ref: '#/components/schemas/ArticleRewriterResponse',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

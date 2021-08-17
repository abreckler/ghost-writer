export const infoBlock = {
  tags: ['Article Summarizer'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Article Summarizer API',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const ArticleSummarizerResponseSchema = {
  properties: {
    text: {
      type: 'string',
      example: 'x-wing',
    },
  },
};

export const articleSummarizer = {
  '/api/article-summarizer/write': {
    post: {
      ...infoBlock,
      description: 'Rewrite an article',
      parameters: [
        {
          name: 'text',
          in: 'params',
          description: 'Source article text to summarize',
          required: false,
          schema: {
            type: 'string',
            example: 'Source article text to summarize',
          },
        },
        {
          name: 'url',
          in: 'params',
          description: 'Source article url to summarize',
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
                $ref: '#/components/schemas/ArticleSummarizerResponse',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

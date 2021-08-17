export const infoBlock = {
  tags: ['Article Extractor'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Article Extractor API',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const ArticleExtractorResponseSchema = {
  properties: {
    text: {
      type: 'string',
      example: 'x-wing',
    },
  },
};

export const articleExtractor = {
  '/api/article-extractor/write': {
    post: {
      ...infoBlock,
      description: 'Extract key sentences from an article',
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
          description: 'Key sentences extracted from the article',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/ArticleExtractorResponse',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

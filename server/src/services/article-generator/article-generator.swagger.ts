import { acceptVersion } from '../apiDocs/swaggerDocs/common';

export const infoBlock = {
  tags: ['article generator'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Article Generator API',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const articleGeneratorResponseSchema = {
  properties: {
    text: {
      type: 'string',
      example: 'x-wing',
    },
  },
};

export const articleGenerator = {
  '/article-generator/write': {
    get: {
      ...infoBlock,
      description: 'Generate an article from the seed text',
      parameters: [
        acceptVersion,
        {
          name: 'seed_text',
          in: 'params',
          description: 'Seed Text',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
        {
          name: 'output_format',
          in: 'params',
          description: 'Output Format',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
        {
          name: 'num_serp_results',
          in: 'params',
          description: 'Number of SERP API Result to include in the article generation process',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
        {
          name: 'num_outbound_links_per_serp_result',
          in: 'params',
          description: 'Number of outbound links to include in each paragraph',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Generated Text',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/articleGeneratorResponseSchema',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

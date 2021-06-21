import { acceptVersion } from '../apiDocs/swaggerDocs/common';

export const infoBlock = {
  tags: ['OpenAI', 'GPT-3'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'OpenAI APIs',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const openai = {
  '/openai/engines': {
    get: {
      ...infoBlock,
      description: 'OpenAI - List engines',
      parameters: [acceptVersion],
      responses: {
        '200': {
          description: 'List of available engines',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/StarShip',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

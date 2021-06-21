export const infoBlock = {
  tags: ['OpenAI'],
  description: 'OpenAI API wrapper',
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
      parameters: [],
      responses: {
        '200': {
          description: 'List of available engines',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/UnknownYet',
              },
            },
          },
        },
        400: {},
      },
    },
  },
  '/openai/engines/{engine}/search': {
    post: {
      ...infoBlock,
      description: 'OpenAI - Search engines',
      parameters: [],
      responses: {
        '200': {
          description: 'Search engines',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/UnknownYet',
              },
            },
          },
        },
        400: {},
      },
    },
  },
  '/openai/engines/{engine}/completions': {
    post: {
      ...infoBlock,
      description: 'OpenAI - Completion API',
      parameters: [],
      responses: {
        '200': {
          description: 'Auto-completed text',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/UnknownYet',
              },
            },
          },
        },
        400: {},
      },
    },
  },
};

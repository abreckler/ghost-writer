export const infoBlock = {
  tags: ['RapidAPI'],
  description: 'RapidAPI wrapper',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'RapidAPI wrapper',
  security: [
    {
      bearerAuth: [],
    },
  ],
};

export const rapidapi = {
  '/rapidapi/twinword-topic-tagging/generate': {
    post: {
      ...infoBlock,
      description: 'Topic Tagging API by Twinword',
      parameters: [
        {
          name: 'text',
          in: 'params',
          description: 'Source Text',
          required: true,
          schema: {
            type: 'string',
            example: '12',
          },
        },
      ],
      responses: {
        '200': {
          description: '',
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

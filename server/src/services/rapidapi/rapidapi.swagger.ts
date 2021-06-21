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
  '/rapidapi/textanalysis-text-summarization/text-summarizer-text': {
    post: {
      ...infoBlock,
      description: 'Text summarization API by textanalysis',
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
        {
          name: 'sentnum',
          in: 'params',
          description: 'Level',
          required: false,
          schema: {
            type: 'number',
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
  '/rapidapi/rewriter-paraphraser-text-changer-multi-language/rewrite': {
    post: {
      ...infoBlock,
      description: 'Text rewrite API by smodin',
      parameters: [
        {
          name: 'starship id',
          in: 'params',
          description: 'Starship ID',
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

import { acceptVersion } from "../apiDocs/swaggerDocs/common"

export const infoBlock = {
  tags: ['notes'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'Notes',
  // operationId: 'getPingz', // Have this value equal the controller/service method
  security: [
    {
      bearerAuth: [],
    },
  ]
};

export const notes = {
  '/note/all': {
    get: {
      ...infoBlock,
      description: "Get all notes",
      parameters: [
        acceptVersion,
      ],
      responses: {
        '200': {
          description: 'Collection of notes',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Note',
                },
              },
            },
          },
        },
        400: {},
      },
    }
  },
  '/note/{note_id}': {
    get: {
      ...infoBlock,
      description: "Get note by ID",
      parameters: [
        acceptVersion,
        {
          name: 'note id',
          in: 'params',
          description: 'Note ID',
          required: true,
          schema: {
            type: 'string',
            example: '12345-6789'
          },
        },
      ],
      responses: {
        '200': {
          description: 'Collection of notes',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/Note',
              },
            },
          },
        },
        400: {},
      },
    },
    delete: {
      ...infoBlock,
      description: "Delete note by ID",
      parameters: [
        acceptVersion,
        {
          name: 'note id',
          in: 'params',
          description: 'Note ID',
          required: true,
          schema: {
            type: 'string',
            example: '12345-6789'
          },
        },
      ],
      responses: {
        '204': {
          description: 'Deleted',
        },
        400: {},
      },
    },
    put: {
      ...infoBlock,
      description: "Update note by ID",
      parameters: [
        acceptVersion,
        {
          name: 'note id',
          in: 'params',
          description: 'Note ID',
          required: true,
          schema: {
            type: 'string',
            example: '12345-6789'
          },
        },
      ],
      responses: {
        '204': {
          description: 'Update a note',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                type: 'object',
                $ref: '#/components/schemas/Note',
              },
            },
          },
        },
        400: {},
      },
    },
    head: {
      ...infoBlock,
      description: "Validate note exists by ID",
      parameters: [
        acceptVersion,
        {
          name: 'note id',
          in: 'params',
          description: 'Note ID',
          required: true,
          schema: {
            type: 'string',
            example: '12345-6789'
          },
        },
      ],
      responses: {
        '200': {
          description: 'Note is found',
        },
        400: {},
      },
    },
  }
};

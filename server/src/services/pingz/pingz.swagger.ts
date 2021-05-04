export const pingz = {
  '/pingz': {
    get: {
      parameters: [
        {
          name: 'Accept-version',
          in: 'header',
          description: 'API Version',
          required: true,
          schema: {
            type: 'string',
            example: 'Apple',
            nullable: true,
          },
        },
      ],
      tags: ['health check'],
      description: 'Returns information on the server status',
      produces: ['application/json', 'charset=utf-8'],
      summary: '',
      operationId: 'getPingz',
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Server info',
          content: {
            'application/json; charset=utf-8': {
              schema: {
                $ref: '#/components/schemas/Pingz',
              },
            },
          },
        },
        400: {},
      },
    }
  }
};

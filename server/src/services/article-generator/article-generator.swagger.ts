import { acceptVersion } from "../apiDocs/swaggerDocs/common"

export const infoBlock = {
  tags: ['starwars'],
  description: '',
  produces: ['application/json', 'charset=utf-8'],
  summary: 'StarWars starship API',
  security: [
    {
      bearerAuth: [],
    },
  ]
};

export const starship = {
  '/starwars/starship/{id}': {
    get: {
      ...infoBlock,
      description: "Get starship by its id",
      parameters: [
        acceptVersion,
        {
          name: 'starship id',
          in: 'params',
          description: 'Starship ID',
          required: true,
          schema: {
            type: 'string',
            example: '12'
          },
        },
      ],
      responses: {
        '200': {
          description: 'StarWars API: starship',
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
    }
  }
}

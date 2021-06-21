export const Pingz = {
  description: 'Health check and end point for K8 + basic service info',
  example: {
    appName: 'the app name',
    dateTime: new Date().toISOString(),
    apiDocs: '/api-docs',
  },
  properties: {
    appName: {
      type: 'string',
    },
    dateTime: {
      type: 'string',
      description: 'Server date time',
    },
    apiDocs: {
      type: 'string',
      description: 'URL of api documentation',
    },
  },
};

export const Note = {
  properties: {
    _id: {
      type: 'integer',
    },
    createdOn: {
      type: 'string',
    },
    updatedOn: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    locked: {
      type: 'boolean',
    },
    deleted: {
      required: false,
      $ref: '#/components/schemas/Deleted',
    },
    user: {
      $ref: '#/components/schemas/User',
    },
  },
};

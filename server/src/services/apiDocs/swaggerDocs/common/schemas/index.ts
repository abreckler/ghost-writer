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

export const UnknownYet = {
  properties: {},
};

export const errors = {
  notFound: {
    id: 'not_found',
    message: 'The resource you were accessing cannot be found.',
  },
  badRequest: {
    id: 'bad_request',
    message: 'The request was invalid or cannot be otherwise served.',
  },
  unAuthorized: {
    id: 'unauthorized',
    message: 'Access is denied due to invalid credentials.',
  },
  forbidden: {
    id: 'forbidden',
    message: 'You do not have access for the attempted action.',
  },
  cache: {
    id: 'cache',
    message: 'There is a problem with the cache',
  },
  internalServerError: {
    id: 'internal_server_error',
    message: 'Something is broken.',
  },
  apiInvalid: {
    id: 'api_invalid_header',
    message: 'Check the request header defines the api version',
  },
  apiDocs: {
    id: 'api_version',
    message: 'Invalid API Docs version request',
  },
};

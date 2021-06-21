import swaggerUI from 'swagger-ui-express';
import express, { Request, Response, NextFunction } from 'express';
import { swaggerDocument as v1 } from './swaggerDocs/v1';

export const apiDocsRouter = express.Router();

const options: swaggerUI.SwaggerOptions = {
  explorer: true,
  customSiteTitle: 'my-api-server',
  swaggerOptions: {
    urls: [
      {
        url: 'http://localhost:3000/api-docs/version/v1',
        name: 'Apple',
      },
    ],
  },
};

apiDocsRouter.get('/version/1_0', (req: Request, res: Response, next: NextFunction) => res.status(200).json(v1));
// eslint-disable-next-line
// @ts-ignore
apiDocsRouter.get('/open-api/doc.json', (req: Request, res: Response, next: NextFunction) =>
  res.status(200).json(swaggerUI.serveFiles(undefined, options)),
);

apiDocsRouter.use('/', swaggerUI.serve, (req: Request, res: Response, next: NextFunction) => {
  try {
    // eslint-disable-next-line
    // @ts-ignore
    return swaggerUI.setup(null, options)(req, res, next);
  } catch (error) {
    next(error);
  }
});

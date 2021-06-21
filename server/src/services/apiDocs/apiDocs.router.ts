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
        name: 'v1',
      },
    ],
  },
};

apiDocsRouter.get('/version/v1', (req: Request, res: Response, next: NextFunction) => res.status(200).json(v1));

apiDocsRouter.get('/open-api/doc.json', (req: Request, res: Response, next: NextFunction) =>
  res.status(200).json(swaggerUI.serveFiles(undefined, options)),
);

apiDocsRouter.use('/', swaggerUI.serve, (req: Request, res: Response, next: NextFunction) => {
  try {
    return swaggerUI.setup(undefined, options)(req, res, next);
  } catch (error) {
    next(error);
  }
});

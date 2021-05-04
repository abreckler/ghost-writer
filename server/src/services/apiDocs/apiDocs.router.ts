import swaggerUI from 'swagger-ui-express';
import express, { Request, Response, NextFunction } from 'express';
import { swaggerDocument as v1 } from './swaggerDocs/Apple';
import { swaggerDocument as v2 } from './swaggerDocs/Banana';

export const apiDocsRouter = express.Router();

const options: swaggerUI.SwaggerOptions = {
  explorer: true,
  customSiteTitle: 'my-api-server',
  swaggerOptions: {
    urls: [
      {
        url: 'http://localhost:3000/api-docs/version/apple',
        name: 'Apple',
      },
      {
        url: 'http://localhost:3000/api-docs/version/banana',
        name: 'Banana',
      },
    ],
  },
};

apiDocsRouter.get('/version/apple', (req: Request, res: Response, next: NextFunction) => res.status(200).json(v1));
apiDocsRouter.get('/version/banana', (req: Request, res: Response, next: NextFunction) => res.status(200).json(v2));
// eslint-disable-next-line
// @ts-ignore
apiDocsRouter.get('/open-api/doc.json', (req: Request, res: Response, next: NextFunction) => res.status(200).json(swaggerUI.serveFiles(null, options)));

apiDocsRouter.use('/', swaggerUI.serve, (req: Request, res: Response, next: NextFunction) => {
  try {

    // eslint-disable-next-line
    // @ts-ignore
    return swaggerUI.setup(null, options)(req, res, next);
  } catch (error) {
    next(error);
  }
});

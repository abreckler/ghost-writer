import express, { Request, Response, NextFunction } from 'express';

export const pingzRouter = express.Router();

pingzRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    appName: 'The app name',
    dateTime: new Date().toISOString(),
    apiDocs: '/api-docs',
  });
});

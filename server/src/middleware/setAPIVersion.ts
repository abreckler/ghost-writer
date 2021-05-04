import { Request, Response, NextFunction } from 'express';

export const setAPIVersion = (req: Request, res: Response, next: NextFunction) => {
  if (req && req.headers) {
    if (req.header('accept-version')) {
      req.version = req.header('accept-version')?.toLowerCase();
    }
  }
  next();
};

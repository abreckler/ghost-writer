import errors from '../lib/errors';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof errors.BaseError) {
    if (err.message) {
      err.info.message = err.message;
    }
    res.status(err.statusCode as number).json(err.info);
  } else {
    const internalServerError = new errors.InternalServerError('');
    if (err.message) {
      internalServerError.info.message = err.message;
    }
    res.status(internalServerError.statusCode).json({ data: internalServerError.info });
  }
};

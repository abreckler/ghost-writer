import { Request, Response, NextFunction } from "express";
import errors from '../lib/errors';

/*
This middleware takes the request body and original URL, hashes them to create an ID then queries the cache service E.g. Redis with that ID.
If no document is found then move onto the next step
*/
export default async ({ body, originalUrl }: Request, res: Response, next: NextFunction) => {
  try {
    next();
  } catch ({ message }) {
    next(new errors.CacheError(message));
  }
}
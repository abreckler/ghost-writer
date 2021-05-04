import { Request, Response, NextFunction } from 'express';
import errors from '../errors';

const versionRouter = (versionsMap = new Map(), options = new Map()) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = req.version?.toLowerCase();
      for (const [key, routerMethod] of versionsMap) {
        if (key === version) {
          return routerMethod(req, res, next);
        }
      }
      throw new errors.APIInvalidHeader();
    } catch (error) {
      next(error);
    }
  };
};

export default versionRouter;

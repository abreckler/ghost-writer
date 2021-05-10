import { Request, Response, NextFunction } from 'express';

export const authentication = (req: Request, res: Response, next: NextFunction) => {
  console.log('authentication');
  if (req.header('X-MyApi-Key') === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Authentication Required!',
    });
  }
};

import { Request, Response, NextFunction } from 'express';

export const authorization = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('authorization role:', role);
    next();
  };
};

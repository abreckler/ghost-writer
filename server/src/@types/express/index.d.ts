import { Express } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    version?: string;
  }
  interface Response {
    version?: string;
  }
}

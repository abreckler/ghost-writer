import { expect } from 'chai';
import versionRouter from './index';
import { Request, Response, NextFunction } from 'express';

const APIv = 'apple';
const requestedVersion = 'apple';
const testMap = new Map();

describe('versionRouter', () => {
  beforeEach(function () {
    testMap.set(APIv, (req: Request, res: Response, next: NextFunction) => {
      return { version: APIv };
    });
  });

  it('Valid api version', () => {
    const clientRequest = { version: requestedVersion };
    const mw = versionRouter(testMap);
    const r = mw((clientRequest as unknown) as Request, {} as Response, () => {
      // Do nothing
    });
    expect(r.version).to.equal(APIv);
  });
});

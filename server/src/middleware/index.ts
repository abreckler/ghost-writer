import { errorHandler } from './errorHandler';
import { setAPIVersion } from './setAPIVersion';
import { authentication } from './auth/authentication';
import { authorization } from './auth/authorization';
import Cache from "./cache";

export default {
  authentication,
  authorization,
  errorHandler,
  setAPIVersion,
  Cache,
};

import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class APIInvalidHeader extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.apiInvalid.message);
    this.info = errors.apiInvalid;
    this.statusCode = 400;
  }
}

export default APIInvalidHeader;

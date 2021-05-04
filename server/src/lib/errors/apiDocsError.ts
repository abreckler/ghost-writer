import BaseError from './baseError';
import { errors } from '../../config/errorMessages';

class APIDocs extends BaseError {
  info: { id: string; message: string };
  statusCode: number;
  constructor(message?: string) {
    super(message || errors.apiDocs.message);
    this.info = errors.apiDocs;
    this.statusCode = 400;
  }
}

export default APIDocs;
